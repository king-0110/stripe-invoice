import streamlit as st
import stripe
import time
import pandas as pd

# Page config
st.set_page_config(
    page_title="Stripe Invoice Dispatcher (Python PRO)",
    page_icon="⚡",
    layout="wide",
)

# Custom Styling
st.markdown(
    """
    <style>
    .main { background-color: #070b14; color: #f8fafc; }
    .stTextInput input, .stTextArea textarea, .stSelectbox select {
        background-color: #020617;
        color: #f8fafc;
        border: 1px solid #1e293b;
        border-radius: 0.75rem;
    }
    .metric-card {
        background-color: #020617;
        border: 1px solid #1e293b;
        padding: 1rem;
        border-radius: 0.75rem;
    }
    </style>
""",
    unsafe_allow_html=True,
)

# Initialize Session State
if "api_key" not in st.session_state:
    st.session_state.api_key = ""
if "is_validated" not in st.session_state:
    st.session_state.is_validated = False
if "account_info" not in st.session_state:
    st.session_state.account_info = None
if "customers" not in st.session_state:
    st.session_state.customers = [{"email": "client@example.com", "name": "Acme Corp"}]
if "items" not in st.session_state:
    st.session_state["items"] = [
        {"id": "1", "description": "Professional Consulting & Development", "unit_amount": 250.0, "quantity": 1}
    ]
if "logs" not in st.session_state:
    st.session_state.logs = []
if "results" not in st.session_state:
    st.session_state.results = []
if "dispatching" not in st.session_state:
    st.session_state.dispatching = False

def log_event(type_str, message):
    timestamp = time.strftime("%H:%M:%S")
    st.session_state.logs.insert(0, {"time": timestamp, "type": type_str, "message": message})

# Keep the Stripe API key set across Streamlit reruns (needed for dispatch after verify)
if st.session_state.get("api_key"):
    stripe.api_key = st.session_state["api_key"]

# App Header
st.markdown("## ⚡ Stripe Invoice Dispatcher PRO <span style='font-size: 12px; background: rgba(99,102,241,0.2); color: #818cf8; padding: 2px 8px; border-radius: 10px;'>Python Edition</span>", unsafe_allow_html=True)
st.markdown("Automated Stripe billing, batch customer invoicing & dispatch built in Python & Streamlit.", unsafe_allow_html=True)
st.markdown("---")

# ==========================================
# SECTION 1: API INTEGRATION
# ==========================================
st.markdown("### 🔑 Section 1: API Integration")
col1, col2 = st.columns([3, 1])

with col1:
    entered_key = st.text_input(
        "Stripe Secret / Restricted Key",
        value=st.session_state.api_key,
        type="password",
        placeholder="sk_test_... or sk_live_...",
    )

with col2:
    st.markdown("<div style='height: 28px;'></div>", unsafe_allow_html=True)
    if st.button("Connect & Verify", use_container_width=True):
        key = entered_key.strip()
        valid_prefixes = ("sk_test_", "sk_live_", "rk_test_", "rk_live_")
        if not key:
            st.error("Please enter a Stripe key.")
        elif key.startswith("pk_"):
            st.error("This is a publishable key (pk_). Invoicing requires a Secret (sk_) or Restricted (rk_) key.")
        elif not key.startswith(valid_prefixes):
            st.error("Invalid key format. Stripe keys must start with sk_test_, sk_live_, rk_test_, or rk_live_.")
        else:
            try:
                stripe.api_key = key
                account = stripe.Account.retrieve()

                # Try fetching balance
                balance_avail = 0.0
                curr = "USD"
                try:
                    bal = stripe.Balance.retrieve()
                    if bal.get("available"):
                        balance_avail = bal["available"][0]["amount"] / 100
                        curr = bal["available"][0]["currency"].upper()
                except:
                    pass

                st.session_state.api_key = key
                st.session_state.is_validated = True
                st.session_state.account_info = {
                    "id": account.get("id"),
                    "business_name": account.get("business_profile", {}).get("name") or account.get("settings", {}).get("dashboard", {}).get("display_name") or "Stripe Account",
                    "country": account.get("country", "US"),
                    "currency": curr,
                    "charges_enabled": account.get("charges_enabled", False),
                    "livemode": key.startswith("sk_live_") or key.startswith("rk_live_"),
                    "balance": balance_avail,
                }
                log_event("SUCCESS", f"Successfully connected to Stripe account: {st.session_state.account_info['business_name']}")
                st.success("Connected successfully!")
                st.rerun()
            except stripe.error.AuthenticationError:
                st.session_state.is_validated = False
                st.session_state.account_info = None
                stripe.api_key = None
                msg = "Authentication failed. This API key is invalid, expired, or revoked."
                log_event("ERROR", msg)
                st.error(msg)
            except stripe.error.PermissionError:
                st.session_state.is_validated = False
                st.session_state.account_info = None
                stripe.api_key = None
                msg = "This restricted key lacks permission to read account details. Grant it read access."
                log_event("ERROR", msg)
                st.error(msg)
            except Exception as e:
                st.session_state.is_validated = False
                st.session_state.account_info = None
                stripe.api_key = None
                log_event("ERROR", f"Stripe authentication failed: {str(e)}")
                st.error(f"Authentication failed: {str(e)}")

if st.session_state.is_validated and st.session_state.account_info:
    acc = st.session_state.account_info
    c1, c2, c3, c4 = st.columns(4)
    with c1:
        st.info(f"**Account:** {acc['business_name']}\n`{acc['id']}`")
    with c2:
        st.success(f"**Region / Currency:** {acc['country']} · {acc['currency']}")
    with c3:
        mode_str = "🔴 Live Mode" if acc['livemode'] else "🔵 Test Mode"
        st.warning(f"**Mode:** {mode_str}")
    with c4:
        st.metric("Available Balance", f"${acc['balance']:,.2f} {acc['currency']}")

st.markdown("---")

# ==========================================
# ROW 2: SECTION 2 (MEMO) & SECTION 3 (FOOTER)
# ==========================================
col_memo, col_footer = st.columns(2)

with col_memo:
    st.markdown("### 📝 Section 2: Invoice Memo")
    memo = st.text_area(
        "Header Note / Memo",
        value="Thank you for your business! Please remit payment at your earliest convenience.",
        height=115,
    )
    if st.button("Quick Preset: Standard Thanks"):
        memo = "Thank you for your business! Please pay within the due date."
        st.rerun()

with col_footer:
    st.markdown("### 📋 Section 3: Invoice Footer & Terms")
    footer = st.text_area(
        "Footer / Payment Terms",
        value="Payment due upon receipt. For billing inquiries, contact accounting@yourcompany.com.",
        height=75,
    )
    days_due = st.slider("Days Until Due", min_value=1, max_value=90, value=7)

st.markdown("---")

# ==========================================
# ROW 3: SECTION 4 (CUSTOMER RECIPIENTS) & SECTION 5 (PRODUCTS & PRICES)
# ==========================================
col_cust, col_prod = st.columns(2)

with col_cust:
    st.markdown("### 👥 Section 4: Customer Recipients")

    input_mode = st.radio("Input Mode", ["Bulk Import", "Single Add"], horizontal=True)

    if input_mode == "Single Add":
        with st.form("single_cust_form", clear_on_submit=True):
            c_email = st.text_input("Customer Email *")
            c_name = st.text_input("Customer Name (Optional)")
            submitted = st.form_submit_button("Add Recipient")
            if submitted and c_email:
                if not any(c["email"].lower() == c_email.lower().strip() for c in st.session_state.customers):
                    st.session_state.customers.append({"email": c_email.strip(), "name": c_name.strip() if c_name else None})
                    log_event("INFO", f"Added recipient: {c_email}")
                    st.success(f"Added {c_email}")
                    st.rerun()
    else:
        bulk_input = st.text_area(
            "Paste Emails (one per line or Name <email>):",
            placeholder="client1@acme.com\nJane Doe <jane@acme.com>",
            height=100,
        )
        if st.button("Parse & Append Recipients"):
            if bulk_input:
                lines = bulk_input.split("\n")
                added = 0
                for line in lines:
                    line = line.strip()
                    if not line:
                        continue
                    email = line
                    name = None
                    if "<" in line and ">" in line:
                        parts = line.split("<")
                        name = parts[0].strip()
                        email = parts[1].replace(">", "").strip()
                    elif "," in line:
                        parts = line.split(",")
                        email = parts[0].strip()
                        name = parts[1].strip()

                    if "@" in email:
                        if not any(c["email"].lower() == email.lower() for c in st.session_state.customers):
                            st.session_state.customers.append({"email": email.lower(), "name": name})
                            added += 1
                log_event("INFO", f"Bulk imported {added} recipients.")
                st.success(f"Successfully imported {added} recipients!")
                st.rerun()

    st.markdown(f"**Current Queue ({len(st.session_state.customers)} recipients):**")
    if st.session_state.customers:
        df_cust = pd.DataFrame(st.session_state.customers)
        st.dataframe(df_cust, use_container_width=True, hide_index=True)
        if st.button("Clear All Recipients"):
            st.session_state.customers = []
            st.rerun()

with col_prod:
    st.markdown("### 🛍️ Section 5: Global Products & Prices")

    currency = st.selectbox("Invoice Currency", ["USD", "EUR", "GBP", "CAD", "AUD", "JPY", "INR"])

    st.markdown("**Line Items:**")
    for idx, item in enumerate(st.session_state["items"]):
        cols = st.columns([4, 2, 1, 1])
        with cols[0]:
            st.session_state["items"][idx]["description"] = st.text_input(f"Desc #{idx+1}", value=item["description"], key=f"desc_{idx}")
        with cols[1]:
            st.session_state["items"][idx]["unit_amount"] = st.number_input(f"Price #{idx+1}", min_value=0.0, value=float(item["unit_amount"]), step=10.0, key=f"price_{idx}")
        with cols[2]:
            st.session_state["items"][idx]["quantity"] = st.number_input(f"Qty #{idx+1}", min_value=1, value=int(item["quantity"]), key=f"qty_{idx}")
        with cols[3]:
            st.markdown("<div style='height: 28px;'></div>", unsafe_allow_html=True)
            if len(st.session_state["items"]) > 1 and st.button("❌", key=f"del_{idx}"):
                st.session_state["items"].pop(idx)
                st.rerun()

    if st.button("➕ Add Line Item"):
        st.session_state["items"].append({"id": str(time.time()), "description": "", "unit_amount": 100.0, "quantity": 1})
        st.rerun()

    subtotal = sum(i["unit_amount"] * i["quantity"] for i in st.session_state["items"])
    curr_symbol = "€" if currency == "EUR" else "£" if currency == "GBP" else "¥" if currency == "JPY" else "₹" if currency == "INR" else "$"
    st.markdown(f"### Subtotal: `{curr_symbol}{subtotal:,.2f} {currency}`")

st.markdown("---")

# ==========================================
# ROW 4: INVOICE SUMMARY & LIVE PROCESS MONITOR
# ==========================================
col_summary, col_monitor = st.columns([5, 7])

with col_summary:
    st.markdown("### 📊 Summary & Dispatch")
    st.markdown(f"- **Recipients:** {len(st.session_state.customers)} queued")
    st.markdown(f"- **Line Items:** {len(st.session_state["items"])} item(s)")
    st.markdown(f"- **Due Term:** Net {days_due} days")
    st.markdown(f"- **Amount per Invoice:** `{curr_symbol}{subtotal:,.2f} {currency}`")

    can_dispatch = st.session_state.is_validated and len(st.session_state.customers) > 0 and len(st.session_state["items"]) > 0

    if st.button("🚀 Dispatch Invoices Now", type="primary", use_container_width=True, disabled=not can_dispatch):
        st.session_state.dispatching = True
        st.session_state.results = []
        log_event("START", f"Initiated batch dispatch pipeline for {len(st.session_state.customers)} recipient(s)...")

        success_count = 0
        error_count = 0

        for idx, customer in enumerate(st.session_state.customers):
            email = customer["email"]
            name = customer.get("name")
            start_t = time.time()

            log_event("INFO", f"[{idx+1}/{len(st.session_state.customers)}] Processing customer: {email}...")

            try:
                # 1. Get or create customer in Stripe
                existing = stripe.Customer.list(email=email, limit=1)
                if existing.data:
                    cust_id = existing.data[0].id
                else:
                    new_cust = stripe.Customer.create(email=email, name=name, description="Created via Python Stripe Dispatcher")
                    cust_id = new_cust.id

                # 2. Create invoice items
                for item in st.session_state["items"]:
                    if not item["description"].strip():
                        continue
                    stripe.InvoiceItem.create(
                        customer=cust_id,
                        amount=int(float(item["unit_amount"]) * 100),
                        currency=currency.lower(),
                        description=item["description"],
                        quantity=int(item["quantity"]),
                    )

                # 3. Create invoice
                inv = stripe.Invoice.create(
                    customer=cust_id,
                    collection_method="send_invoice",
                    days_until_due=days_due,
                    description=memo if memo else None,
                    footer=footer if footer else None,
                    auto_advance=True,
                )

                # 4. Finalize & send
                finalized = stripe.Invoice.finalize_invoice(inv.id, auto_advance=True)
                try:
                    sent = stripe.Invoice.send_invoice(finalized.id)
                except:
                    sent = finalized

                duration = int((time.time() - start_t) * 1000)
                success_count += 1

                st.session_state.results.append({
                    "email": email,
                    "status": "Success",
                    "invoice_no": sent.get("number"),
                    "url": sent.get("hosted_invoice_url"),
                    "total": (sent.get("total", 0) / 100),
                    "duration": f"{duration}ms",
                })
                log_event("SUCCESS", f"Invoice #{sent.get('number')} sent to {email} ({duration}ms)")

            except Exception as e:
                error_count += 1
                duration = int((time.time() - start_t) * 1000)
                st.session_state.results.append({
                    "email": email,
                    "status": "Failed",
                    "error": str(e),
                    "duration": f"{duration}ms",
                })
                log_event("ERROR", f"Failed sending to {email}: {str(e)}")

        st.session_state.dispatching = False
        log_event("COMPLETE", f"Batch dispatch finished: {success_count} successful, {error_count} failed.")
        st.success("Batch dispatch completed!")
        st.rerun()

with col_monitor:
    st.markdown("### 🖥️ Live Process Monitor")

    total_cust = len(st.session_state.customers)
    success_c = sum(1 for r in st.session_state.results if r["status"] == "Success")
    error_c = sum(1 for r in st.session_state.results if r["status"] == "Failed")
    processed_c = success_c + error_c

    # Big Counter
    st.markdown(
        f"""
        <div style="background: #020617; border: 1px solid #1e293b; padding: 16px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center;">
            <div>
                <span style="font-size: 11px; color: #94a3b8; text-transform: uppercase;">Invoices Dispatched</span>
                <div style="font-size: 32px; font-weight: bold; font-family: monospace; color: #34d399;">
                    {success_c} <span style="font-size: 20px; color: #64748b;">/ {total_cust}</span>
                </div>
            </div>
            <div style="text-align: right;">
                <span style="font-size: 11px; color: #94a3b8; text-transform: uppercase;">Success Rate</span>
                <div style="font-size: 24px; font-weight: bold; font-family: monospace; color: #38bdf8;">
                    {round((success_c / processed_c * 100)) if processed_c > 0 else 0}%
                </div>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

    tab_status, tab_logs = st.tabs(["📋 Recipient Status", "💻 Terminal Logs"])

    with tab_status:
        if st.session_state.results:
            df_res = pd.DataFrame(st.session_state.results)
            st.dataframe(df_res, use_container_width=True, hide_index=True)
        else:
            st.info("No dispatch runs executed yet.")

    with tab_logs:
        if st.session_state.logs:
            log_text = "\n".join([f"[{l['time']}] [{l['type']}] {l['message']}" for l in st.session_state.logs])
            st.text_area("Console Log", value=log_text, height=200, disabled=True)
        else:
            st.info("Terminal idle. Ready for batch dispatch.")
