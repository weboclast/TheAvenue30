import { type LegalDocument, legalEntity } from './legal'

/**
 * The contract a shopper accepts at checkout. Returns get a section here rather
 * than a document of their own: the legal promise is the same in every store,
 * while the practical policy (windows, who pays return shipping, which products
 * are excluded) differs per storefront and belongs beside the product.
 */
export const termsOfService = {
  slug: 'terms-of-service',
  title: 'Terms of service',
  summary: `The agreement between you and ${legalEntity.name} when you browse this store, open an account, or place an order.`,
  effectiveDate: '2026-09-01',
  sections: [
    {
      id: 'agreement',
      title: 'Agreement to these terms',
      blocks: [
        {
          type: 'paragraph',
          text: `These terms are an agreement between you and ${legalEntity.name} ("we", "us", "our"). They apply every time you visit this store, open an account, or buy something from us.`,
        },
        {
          type: 'paragraph',
          text: 'By using the store you accept these terms. If you do not accept them, please do not use the store.',
        },
        {
          type: 'paragraph',
          text: 'Our privacy policy explains what we do with your personal information, and it forms part of this agreement. Nothing here takes away the rights the consumer law where you live gives you.',
        },
      ],
    },
    {
      id: 'eligibility',
      title: 'Who may use the store',
      blocks: [
        {
          type: 'paragraph',
          text: 'You must be at least 18, or old enough to enter a binding contract where you live, to buy from us. If you are buying on behalf of a company, you confirm you are allowed to accept these terms for it.',
        },
        {
          type: 'paragraph',
          text: 'We sell to consumers, in the countries listed at checkout. We may refuse or cancel an order that looks like it is for resale, and we may limit the quantity of any product one person can buy.',
        },
      ],
    },
    {
      id: 'your-account',
      title: 'Your account',
      blocks: [
        {
          type: 'paragraph',
          text: 'You can shop as a guest. If you open an account, give us accurate details and keep them up to date, choose a strong password, and keep it to yourself.',
        },
        {
          type: 'paragraph',
          text: 'You are responsible for what happens under your account. Tell us straight away if you think someone else has reached it.',
        },
        {
          type: 'paragraph',
          text: 'You can close your account at any time. We can suspend or close it if you break these terms, if we are required to, or if we reasonably suspect fraud. Closing an account does not cancel an order already placed.',
        },
      ],
    },
    {
      id: 'products-and-pricing',
      title: 'Products, prices, and availability',
      blocks: [],
      subsections: [
        {
          id: 'product-information',
          title: 'Product information',
          blocks: [
            {
              type: 'paragraph',
              text: 'We describe our products as accurately as we can. Photographs are illustrative, and colors vary between screens, so a product may differ slightly from its image. Weights, dimensions, and specifications are approximate unless we say otherwise.',
            },
            {
              type: 'paragraph',
              text: 'Where a manufacturer changes a product, packaging, or its accessories, we may supply the updated version if it is of at least the same quality and specification.',
            },
          ],
        },
        {
          id: 'pricing-and-taxes',
          title: 'Prices and taxes',
          blocks: [
            {
              type: 'paragraph',
              text: 'Prices are shown in the currency you selected and can change at any time before you order. The price that applies is the one shown when you place the order.',
            },
            {
              type: 'paragraph',
              text: 'Checkout shows whether tax is included, and adds shipping and any duties before you pay. For an international order, the customs duties and import taxes of the destination country may be payable on delivery, and they are yours to pay unless we say otherwise.',
            },
            {
              type: 'paragraph',
              text: 'Mistakes happen. If a product is listed at an obviously wrong price, we may cancel the order and refund you in full rather than supply at that price, and we will tell you before we do.',
            },
          ],
        },
        {
          id: 'availability',
          title: 'Availability',
          blocks: [
            {
              type: 'paragraph',
              text: 'Stock shown in the store is our best information and is not a guarantee. If a product turns out to be unavailable after you order, we will tell you and offer a replacement, a wait, or a full refund.',
            },
          ],
        },
      ],
    },
    {
      id: 'orders-and-payment',
      title: 'Orders and payment',
      blocks: [],
      subsections: [
        {
          id: 'placing-an-order',
          title: 'Placing an order',
          blocks: [
            {
              type: 'paragraph',
              text: 'Everything in the store is an invitation to order, not an offer. Your order is the offer, and the contract only exists once we accept it.',
            },
            {
              type: 'paragraph',
              text: 'The confirmation email we send when you order acknowledges that we received it. We accept your order when we dispatch it, or when we tell you we have accepted it, whichever comes first.',
            },
            {
              type: 'paragraph',
              text: 'We may refuse an order where the product is unavailable, where we cannot authorize your payment, where we suspect fraud, where a price or description was wrong, or where we cannot deliver to your address.',
            },
          ],
        },
        {
          id: 'payment',
          title: 'Payment',
          blocks: [
            {
              type: 'paragraph',
              text: 'Checkout lists the payment methods we accept. Payment is taken through our payment provider, which is responsible for processing it securely; we never see or store your full card number.',
            },
            {
              type: 'paragraph',
              text: 'By paying, you confirm the payment method is yours or that you are allowed to use it. If a payment is reversed or charged back without good reason, we may recover what we are owed and suspend your account.',
            },
            {
              type: 'paragraph',
              text: 'Where you pay in instalments or on credit through a third party, that provider’s own terms apply to the credit, alongside these terms for the sale.',
            },
          ],
        },
      ],
    },
    {
      id: 'shipping-and-delivery',
      title: 'Shipping and delivery',
      blocks: [
        {
          type: 'paragraph',
          text: 'Delivery options, costs, and estimated dates are shown at checkout and in your confirmation. Estimates are estimates: carriers, customs, and the weather are not in our control.',
        },
        {
          type: 'paragraph',
          text: 'Risk in the products passes to you when they are delivered to the address you gave us, or to someone at that address. If you ask a carrier to leave a parcel in a safe place, it is delivered when they leave it there.',
        },
        {
          type: 'paragraph',
          text: 'Please check your parcel on arrival and tell us within a reasonable time if anything is missing, damaged, or wrong, so we can put it right.',
        },
      ],
    },
    {
      id: 'returns-and-refunds',
      title: 'Returns, refunds, and cancellations',
      blocks: [
        {
          type: 'paragraph',
          text: 'Our returns policy, including the return window, who pays return shipping, and which products are excluded, is published in the store and applies to every order.',
        },
        {
          type: 'paragraph',
          text: 'If you are a consumer in the European Union or the United Kingdom, you can cancel most online orders within 14 days of receiving them, without giving a reason, and return the products within 14 days of telling us. The law excludes some products from this right, including sealed items unsealed for hygiene reasons, made-to-order goods, and digital content you have begun to download.',
        },
        {
          type: 'paragraph',
          text: 'Returned products should be in the condition you received them, with their packaging and accessories. We may reduce a refund to reflect handling beyond what was needed to check the product.',
        },
        {
          type: 'paragraph',
          text: 'We refund to the payment method you used, within the time the law allows. Your legal rights over faulty or misdescribed products are additional to anything in this section, and nothing here limits them.',
        },
      ],
    },
    {
      id: 'promotions',
      title: 'Promotions, discounts, and rewards',
      blocks: [
        {
          type: 'paragraph',
          text: 'Discount codes, offers, and any rewards program run on their own published conditions. Unless we say otherwise, a code is for 1 use per customer, cannot be combined with another offer, has no cash value, and can be withdrawn at any time before you order.',
        },
        {
          type: 'paragraph',
          text: 'We may cancel a discount, a reward balance, or an order where a code was obtained or used unfairly.',
        },
      ],
    },
    {
      id: 'user-content',
      title: 'Reviews and other content you submit',
      blocks: [
        {
          type: 'paragraph',
          text: 'You can post reviews, ratings, photos, and questions. What you post stays yours, and by posting it you give us a worldwide, non-exclusive, royalty-free licence to display, reproduce, and adapt it in connection with the store and our marketing.',
        },
        {
          type: 'paragraph',
          text: 'You confirm that what you post is your own, is honest, and does not break anyone else’s rights. We only publish reviews from people who bought the product where we say so.',
        },
        {
          type: 'paragraph',
          text: 'We may decline or remove content that is unlawful, misleading, abusive, off-topic, or posted to promote something else. We are not obliged to monitor what people post, and we do not endorse it.',
        },
      ],
    },
    {
      id: 'acceptable-use',
      title: 'Acceptable use',
      blocks: [
        { type: 'paragraph', text: 'Please do not:' },
        {
          type: 'list',
          items: [
            'Break the law, or use the store to harm anyone',
            'Scrape, crawl, or copy the store or its content, except as a search engine normally does',
            'Interfere with the store’s security, availability, or performance',
            'Place orders using someone else’s payment method, or a false identity',
            'Resell our products as an authorized dealer without our written agreement',
            'Reverse engineer any part of the store, except where the law says you may',
          ],
        },
        { type: 'paragraph', text: 'We may suspend access where we reasonably believe any of this is happening.' },
      ],
    },
    {
      id: 'intellectual-property',
      title: 'Intellectual property',
      blocks: [
        {
          type: 'paragraph',
          text: 'The store, its design, text, images, and software are owned by us or licensed to us, and are protected by copyright, trade mark, and other laws. Product names and logos belong to their owners.',
        },
        {
          type: 'paragraph',
          text: 'You may view and print pages for your own personal use of the store. Any other use needs our written permission.',
        },
      ],
    },
    {
      id: 'third-party-services',
      title: 'Third-party services and links',
      blocks: [
        {
          type: 'paragraph',
          text: 'The store uses other companies for payment, delivery, analytics, and support, and it links to sites we do not run. We are not responsible for their content or their practices, and their own terms and privacy policies apply when you deal with them.',
        },
      ],
    },
    {
      id: 'disclaimers',
      title: 'Disclaimers',
      blocks: [
        {
          type: 'paragraph',
          text: 'We work to keep the store available, accurate, and secure, but we provide it "as is". We do not promise it will be uninterrupted, error-free, or free of harmful components, and we may change, suspend, or withdraw any part of it.',
        },
        {
          type: 'paragraph',
          text: 'To the extent the law allows, we exclude the implied warranties it permits us to exclude. If you are a consumer, this section does not affect your statutory rights.',
        },
      ],
    },
    {
      id: 'limitation-of-liability',
      title: 'Limitation of liability',
      blocks: [
        {
          type: 'paragraph',
          text: 'Nothing in these terms excludes our liability for death or personal injury caused by our negligence, for fraud, or for anything the law does not allow us to exclude.',
        },
        {
          type: 'paragraph',
          text: 'Subject to that, we are not liable for loss of profit, loss of business, loss of data, or any indirect or consequential loss, and our total liability for any order is limited to the amount you paid for it.',
        },
        {
          type: 'paragraph',
          text: 'We are responsible for loss you suffer that is a foreseeable result of us breaking this agreement, and not for anything unforeseeable.',
        },
      ],
    },
    {
      id: 'indemnity',
      title: 'Indemnity',
      blocks: [
        {
          type: 'paragraph',
          text: 'If you use the store for a business purpose, you agree to cover our reasonable losses and legal costs arising from your breach of these terms, from content you posted, or from your unlawful use of the store. This does not apply to you as a consumer.',
        },
      ],
    },
    {
      id: 'governing-law',
      title: 'Governing law and disputes',
      blocks: [
        {
          type: 'paragraph',
          text: `These terms are governed by the laws of ${legalEntity.jurisdiction}, and its courts have jurisdiction over any dispute.`,
        },
        {
          type: 'paragraph',
          text: 'If you are a consumer, you keep the protection of the mandatory laws of the country you live in, and you can also bring a claim in your local courts.',
        },
        {
          type: 'paragraph',
          text: 'Please contact us first. Most problems are quicker to solve directly, and we would rather fix one than argue about it.',
        },
      ],
    },
    {
      id: 'general',
      title: 'General',
      blocks: [
        {
          type: 'paragraph',
          text: 'If any part of these terms turns out to be unenforceable, the rest stays in force. If we do not enforce a term straight away, we have not given it up.',
        },
        {
          type: 'paragraph',
          text: 'You may not transfer your rights under these terms without our agreement. We may transfer ours if the business is sold, and it will not affect your rights.',
        },
        {
          type: 'paragraph',
          text: 'These terms, our privacy policy, and the policies they refer to are the whole agreement between us about the store.',
        },
      ],
    },
    {
      id: 'changes',
      title: 'Changes to these terms',
      blocks: [
        {
          type: 'paragraph',
          text: 'We may update these terms as the store, our products, or the law changes. The effective date under the title tells you which version is current.',
        },
        {
          type: 'paragraph',
          text: 'The terms that apply to an order are the ones in force when you placed it, so a change never alters an order you have already made.',
        },
      ],
    },
    {
      id: 'contact',
      title: 'Contact us',
      blocks: [
        {
          type: 'paragraph',
          text: `Write to ${legalEntity.supportEmail} with any question about these terms or about an order.`,
        },
        { type: 'paragraph', text: `Our postal address is ${legalEntity.address}.` },
      ],
    },
  ],
} satisfies LegalDocument
