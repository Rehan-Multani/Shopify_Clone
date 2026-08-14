/**
 * Customer / order email templates (storefront). Independent of shipping.
 */

function wrap({ title, name, bodyHtml }) {
    return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px;">
    <h2 style="color: #0d9488; text-align: center;">${title}</h2>
    <p>Hello <strong>${name || 'there'}</strong>,</p>
    ${bodyHtml}
    <p>Regards,<br/><strong>The store team</strong></p>
  </div>`;
}

const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

const itemLines = (products = []) => (products || [])
    .map((p) => `• ${p.productName || 'Item'} × ${p.quantity || 1} — ${inr(p.price)}`)
    .join('\n');

const itemHtml = (products = []) => (products || [])
    .map((p) => `<li>${p.productName || 'Item'} × ${p.quantity || 1} — ${inr(p.price)}</li>`)
    .join('');

export function customerSignupEmail({ name, email }) {
    return {
        to: email,
        subject: 'Welcome — your account is ready',
        text: `Hello ${name},\n\nYour store account was created successfully.\n\nRegards`,
        html: wrap({
            title: 'Welcome!',
            name,
            bodyHtml: `<p>Your account has been created. You can now shop, track orders, and manage your profile.</p>`,
        }),
    };
}

export function vendorSignupEmail({ name, email, businessName, loginUrl }) {
    const login = loginUrl || `${process.env.FRONTEND_URL || 'http://localhost:5174'}/vendor/login`;
    return {
        to: email,
        subject: 'Your vendor account is ready',
        text: `Hello ${name},\n\nYour vendor account${businessName ? ` for ${businessName}` : ''} is ready.\nLogin: ${login}\nEmail: ${email}\n\nRegards,\nStorify Team`,
        html: wrap({
            title: 'Vendor account created',
            name,
            bodyHtml: `
        <p>Your vendor account${businessName ? ` for <strong>${businessName}</strong>` : ''} is ready.</p>
        <p>Login: <a href="${login}">${login}</a></p>
        <p>Email: ${email}</p>`,
        }),
    };
}

export function orderConfirmationEmail(order) {
    const id = String(order._id || '').slice(-8).toUpperCase();
    const method = order.paymentMethod || 'COD';
    return {
        to: order.customerEmail,
        subject: `Order confirmed #${id}`,
        text: `Hello ${order.customerName},\n\nWe received your order #${id}.\nPayment: ${method}\nTotal: ${inr(order.totalAmount)}\n\n${itemLines(order.products)}`,
        html: wrap({
            title: 'Order confirmed',
            name: order.customerName,
            bodyHtml: `
        <p>We received your order <strong>#${id}</strong>.</p>
        <p>Payment method: <strong>${method}</strong></p>
        <ul>${itemHtml(order.products)}</ul>
        <p><strong>Total: ${inr(order.totalAmount)}</strong></p>`,
        }),
    };
}

export function customerPaymentSuccessEmail(order) {
    const id = String(order._id || '').slice(-8).toUpperCase();
    return {
        to: order.customerEmail,
        subject: `Payment received — order #${id}`,
        text: `Hello ${order.customerName},\n\nPayment for order #${id} was successful. Total ${inr(order.totalAmount)}.`,
        html: wrap({
            title: 'Payment successful',
            name: order.customerName,
            bodyHtml: `
        <p>We received payment for order <strong>#${id}</strong>.</p>
        <p><strong>Amount: ${inr(order.totalAmount)}</strong></p>
        <ul>${itemHtml(order.products)}</ul>`,
        }),
    };
}

const STATUS_COPY = {
    customer_order_processing: {
        subject: (id) => `Order #${id} is being prepared`,
        title: 'Order confirmed',
        body: 'Your order has been accepted and is being prepared.',
    },
    customer_order_shipped: {
        subject: (id) => `Order #${id} has shipped`,
        title: 'Shipped',
        body: 'Your order has been shipped and is on the way.',
    },
    customer_order_out_for_delivery: {
        subject: (id) => `Order #${id} is out for delivery`,
        title: 'Out for delivery',
        body: 'Your order is out for delivery.',
    },
    customer_order_delivered: {
        subject: (id) => `Order #${id} delivered`,
        title: 'Delivered',
        body: 'Your order was delivered. Thank you for shopping with us.',
    },
    customer_order_cancelled: {
        subject: (id) => `Order #${id} cancelled`,
        title: 'Order cancelled',
        body: 'Your order has been cancelled.',
    },
    customer_order_refunded: {
        subject: (id) => `Refund issued for order #${id}`,
        title: 'Refund issued',
        body: 'A refund has been issued for your order.',
    },
};

export function orderStatusEmail(order, event) {
    const copy = STATUS_COPY[event];
    if (!copy || !order?.customerEmail) return null;
    const id = String(order._id || '').slice(-8).toUpperCase();
    return {
        to: order.customerEmail,
        subject: copy.subject(id),
        text: `Hello ${order.customerName},\n\n${copy.body}\nOrder #${id}`,
        html: wrap({
            title: copy.title,
            name: order.customerName,
            bodyHtml: `<p>${copy.body}</p><p>Order <strong>#${id}</strong></p>`,
        }),
    };
}

export default {
    customerSignupEmail,
    vendorSignupEmail,
    orderConfirmationEmail,
    customerPaymentSuccessEmail,
    orderStatusEmail,
};
