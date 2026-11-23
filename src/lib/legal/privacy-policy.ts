import { type LegalDocument, legalEntity } from './legal'

/**
 * The privacy notice. Cookies are a section here rather than a document of their
 * own, because the template ships no consent banner and a standalone cookie
 * policy would advertise a cookie manager that does not exist. A store that adds
 * one should split `cookies` out and link it from the banner.
 */
export const privacyPolicy = {
  slug: 'privacy-policy',
  title: 'Privacy policy',
  summary: `How ${legalEntity.name} collects, uses, and protects the personal information you share when you shop with us.`,
  effectiveDate: '2026-09-01',
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      blocks: [
        {
          type: 'paragraph',
          text: `${legalEntity.name} ("we", "us", "our") runs this online store. This policy explains what personal information we collect when you browse, buy, or create an account, why we collect it, who we share it with, and the choices you have.`,
        },
        {
          type: 'paragraph',
          text: 'It covers this website and the emails and messages we send you about your orders and our products. It does not cover other companies’ websites, even when we link to them.',
        },
        {
          type: 'paragraph',
          text: 'If you do not agree with this policy, please do not use the store. If you have a question about anything in it, write to us; the last section says how.',
        },
      ],
    },
    {
      id: 'information-we-collect',
      title: 'Information we collect',
      blocks: [
        {
          type: 'paragraph',
          text: 'We collect 3 kinds of information: what you give us, what we record automatically as you use the store, and what we receive from the companies that help us run it.',
        },
      ],
      subsections: [
        {
          id: 'information-you-give-us',
          title: 'Information you give us',
          blocks: [
            {
              type: 'paragraph',
              text: 'You give us information when you place an order, open an account, save a wishlist, write a review, contact support, or sign up for our emails. Depending on what you do, that can include:',
            },
            {
              type: 'list',
              items: [
                'Your name, email address, phone number, and password',
                'Shipping and billing addresses',
                'What you ordered, returned, saved, or compared',
                'Payment details, which go straight to our payment provider and are described below',
                'Reviews, ratings, photos, and any message you send our support team',
                'Your marketing preferences, and the language and currency you shop in',
              ],
            },
            {
              type: 'paragraph',
              text: 'You can browse and buy as a guest. An account is optional, and it exists so that your addresses, orders, and saved products are there the next time you visit.',
            },
          ],
        },
        {
          id: 'information-collected-automatically',
          title: 'Information we collect automatically',
          blocks: [
            {
              type: 'paragraph',
              text: 'When you use the store, our servers and our analytics tools record technical details about the visit:',
            },
            {
              type: 'list',
              items: [
                'Your IP address, approximate location derived from it, and time zone',
                'Your browser, operating system, and screen size',
                'The pages you viewed, the products you searched for, and the links you followed',
                'How you reached us, such as a search engine or an email we sent',
                'Identifiers stored in cookies and similar technologies, described in their own section below',
              ],
            },
            {
              type: 'paragraph',
              text: 'We use this to keep the store working, to measure which pages and products people actually use, and to spot fraud and abuse.',
            },
          ],
        },
        {
          id: 'information-from-partners',
          title: 'Information from other companies',
          blocks: [
            {
              type: 'paragraph',
              text: 'Our payment provider tells us whether a payment succeeded, the card type, and the last 4 digits, so you can recognize the card next time. Our carriers tell us where your parcel is. If you sign in with a social or platform account, that provider tells us your name and email address. Advertising and analytics partners may tell us how an ad performed.',
            },
            {
              type: 'paragraph',
              text: 'We never receive your full card number, and we never store it.',
            },
          ],
        },
      ],
    },
    {
      id: 'how-we-use-information',
      title: 'How we use your information',
      blocks: [
        { type: 'paragraph', text: 'We use personal information to:' },
        {
          type: 'list',
          items: [
            'Take, process, ship, and refund your orders, and talk to you about them',
            'Run your account, your wishlists, and your saved addresses and payment methods',
            'Answer your questions and handle returns, warranty claims, and complaints',
            'Show you products, search results, and recommendations that fit what you have looked at',
            'Send you marketing emails and messages, where you have asked for them or where the law allows it',
            'Publish the reviews and ratings you choose to submit',
            'Measure and improve how the store performs, and test changes to it',
            'Detect, investigate, and prevent fraud, abuse, and security incidents',
            'Meet our legal, tax, accounting, and consumer-protection obligations',
          ],
        },
        {
          type: 'paragraph',
          text: 'Where the law requires a legal basis for each use, ours are: performing our contract with you (orders, accounts, support), our legitimate interests (security, fraud prevention, improving the store, direct marketing to existing customers), your consent (optional cookies and most marketing messages), and compliance with a legal obligation (tax and accounting records).',
        },
        {
          type: 'paragraph',
          text: 'We do not make decisions about you by automated means alone that produce a legal or similarly significant effect.',
        },
      ],
    },
    {
      id: 'cookies',
      title: 'Cookies and similar technologies',
      blocks: [
        {
          type: 'paragraph',
          text: 'Cookies are small files a site stores in your browser. We also use local storage and similar technologies, and this section covers all of them together.',
        },
      ],
      subsections: [
        {
          id: 'cookies-we-use',
          title: 'What we use them for',
          blocks: [
            {
              type: 'list',
              items: [
                'Strictly necessary: keeping you signed in, remembering your cart and your wishlist, keeping your checkout secure. The store cannot work without these.',
                'Preferences: your chosen theme, language, currency, and which storefront you last browsed.',
                'Analytics: counting visits and understanding which pages and products people use, so we can improve them.',
                'Marketing: measuring our advertising, and showing you relevant ads on other sites.',
              ],
            },
            {
              type: 'paragraph',
              text: 'Some of these cookies are set by us and some by the companies we work with, such as our analytics and advertising partners.',
            },
          ],
        },
        {
          id: 'managing-cookies',
          title: 'Managing cookies',
          blocks: [
            {
              type: 'paragraph',
              text: 'Where the law requires it, we ask for your consent before setting analytics and marketing cookies, and you can change or withdraw that consent at any time. Strictly necessary cookies do not need consent and cannot be turned off.',
            },
            {
              type: 'paragraph',
              text: 'Your browser also lets you block or delete cookies. Blocking all of them will sign you out and empty your cart, because the store uses cookies to remember both.',
            },
          ],
        },
      ],
    },
    {
      id: 'how-we-share-information',
      title: 'How we share your information',
      blocks: [
        {
          type: 'paragraph',
          text: 'We do not sell your personal information for money. We share it only with the companies that help us run the store, and only with what they need:',
        },
        {
          type: 'list',
          items: [
            'Payment providers, who process your payment and check it for fraud',
            'Carriers and logistics partners, who deliver and return your parcels',
            'Hosting, email, customer-support, and analytics providers',
            'Advertising partners, where you have consented to marketing cookies',
            'Professional advisers, such as our accountants and lawyers',
            'Authorities and regulators, where the law requires it or to defend a legal claim',
            'A buyer or successor, if the business is sold or merged, under the same protections as this policy',
          ],
        },
        {
          type: 'paragraph',
          text: 'Everyone in that list is bound by contract to protect your information, to use it only on our instructions, and not to use it for their own purposes.',
        },
        {
          type: 'paragraph',
          text: 'Some privacy laws treat sharing data with advertising partners as a "sale" or as "sharing for targeted advertising", even when no money changes hands. Where that is the case, you can opt out; see your rights below.',
        },
      ],
    },
    {
      id: 'international-transfers',
      title: 'Where your information is stored',
      blocks: [
        {
          type: 'paragraph',
          text: 'We and our providers may store and process your information in countries other than your own, including countries whose privacy laws differ from the ones where you live.',
        },
        {
          type: 'paragraph',
          text: 'When we move personal information out of the European Economic Area, the United Kingdom, or Switzerland, we rely on an adequacy decision or on standard contractual clauses approved by the relevant authority, together with any extra safeguards the transfer needs. Write to us and we will tell you which applies to your data.',
        },
      ],
    },
    {
      id: 'data-retention',
      title: 'How long we keep it',
      blocks: [
        {
          type: 'paragraph',
          text: 'We keep personal information for as long as we need it for the purpose we collected it, and then for as long as the law requires us to:',
        },
        {
          type: 'list',
          items: [
            'Order and payment records: for the period our tax and accounting rules require, which is commonly 6 to 10 years',
            'Account details: while your account is open, and for a short period after you close it',
            'Support conversations: for as long as needed to resolve the matter, and to handle a related claim',
            'Marketing preferences: until you unsubscribe, and then a record that you did',
            'Analytics data: in aggregated or anonymized form, which is no longer personal information',
          ],
        },
        {
          type: 'paragraph',
          text: 'When we no longer need it, we delete it or anonymize it so it can no longer identify you.',
        },
      ],
    },
    {
      id: 'security',
      title: 'How we protect it',
      blocks: [
        {
          type: 'paragraph',
          text: 'We encrypt traffic to and from the store, restrict who on our team can reach personal information, log administrative access, and review our providers before we use them. Payments run through a certified provider, so card numbers never touch our servers.',
        },
        {
          type: 'paragraph',
          text: 'No service can promise perfect security. Please use a strong, unique password, keep it to yourself, and tell us straight away if you think someone else has reached your account.',
        },
      ],
    },
    {
      id: 'your-rights',
      title: 'Your privacy rights',
      blocks: [
        {
          type: 'paragraph',
          text: 'Whatever country you shop from, you can ask us for a copy of your information, ask us to correct it, ask us to delete it, and unsubscribe from our marketing. The rest of this section covers the additional rights some laws give you.',
        },
      ],
      subsections: [
        {
          id: 'rights-europe',
          title: 'If you are in Europe or the UK',
          blocks: [
            {
              type: 'paragraph',
              text: 'Under the GDPR and UK GDPR you have the right to access, correct, delete, or receive a portable copy of your personal information; to restrict or object to how we use it, including direct marketing and profiling; and to withdraw consent at any time without affecting what we did before you withdrew it.',
            },
            {
              type: 'paragraph',
              text: 'You can also complain to your national data protection authority. We would rather hear from you first, so please give us the chance to put it right.',
            },
          ],
        },
        {
          id: 'rights-united-states',
          title: 'If you are in the United States',
          blocks: [
            {
              type: 'paragraph',
              text: 'Depending on your state, you may have the right to know what personal information we collect and who we disclose it to, to get a copy of it, to correct or delete it, to opt out of targeted advertising and of any "sale" or "sharing" of your data, and to limit our use of sensitive personal information.',
            },
            {
              type: 'paragraph',
              text: 'We will not deny you service, charge you a different price, or give you a lower quality of service because you exercised a privacy right. You may use an authorized agent to make a request on your behalf, and we may ask that agent to prove you authorized them.',
            },
          ],
        },
        {
          id: 'exercising-your-rights',
          title: 'How to exercise your rights',
          blocks: [
            {
              type: 'paragraph',
              text: `Write to ${legalEntity.privacyEmail} and tell us what you want us to do. We will ask for enough information to be sure the request is really yours, which protects you as much as us.`,
            },
            {
              type: 'paragraph',
              text: 'We answer within the time the applicable law allows, which is normally 1 month and can be extended for a complex request. We will tell you if we need longer. Our answer is free, unless a request is repetitive or clearly excessive.',
            },
          ],
        },
      ],
    },
    {
      id: 'childrens-privacy',
      title: 'Children',
      blocks: [
        {
          type: 'paragraph',
          text: 'The store is meant for adults. We do not knowingly collect personal information from children under 16, or under the age set by the law where you live. If you believe a child has given us their information, write to us and we will delete it.',
        },
      ],
    },
    {
      id: 'changes',
      title: 'Changes to this policy',
      blocks: [
        {
          type: 'paragraph',
          text: 'We update this policy when what we do with your information changes, or when the law does. The effective date under the title always tells you which version you are reading.',
        },
        {
          type: 'paragraph',
          text: 'If a change matters to you, we will tell you before it takes effect, by email or with a notice in the store, and we will ask for your consent again where the law requires it.',
        },
      ],
    },
    {
      id: 'contact',
      title: 'Contact us',
      blocks: [
        {
          type: 'paragraph',
          text: `For anything about this policy or your personal information, write to ${legalEntity.privacyEmail}. For orders, deliveries, and returns, our support team is at ${legalEntity.supportEmail}.`,
        },
        { type: 'paragraph', text: `Our postal address is ${legalEntity.address}.` },
      ],
    },
  ],
} satisfies LegalDocument
