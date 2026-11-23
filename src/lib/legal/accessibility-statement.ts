import { type LegalDocument, legalEntity } from './legal'

/*
 * This statement describes what the template actually ships, so it stays true
 * out of the box. Two things are deliberately absent: it claims no audit that
 * has not happened, and it does not mention right-to-left support, because the
 * template ships left-to-right and sets no `dir`. Add both once they are true.
 */
export const accessibilityStatement = {
  slug: 'accessibility-statement',
  title: 'Accessibility statement',
  shortTitle: 'Accessibility',
  summary: `How ${legalEntity.name} works to keep this store usable for everyone, what we have built so far, and how to tell us when we fall short.`,
  effectiveDate: '2026-09-01',
  sections: [
    {
      id: 'our-commitment',
      title: 'Our commitment',
      blocks: [
        {
          type: 'paragraph',
          text: `${legalEntity.name} wants everyone to be able to browse, choose, and buy here, whatever device they use and however they use it. That includes people who navigate by keyboard, people who use a screen reader or magnifier, people with low vision or color blindness, and people who find motion uncomfortable.`,
        },
        {
          type: 'paragraph',
          text: 'Accessibility is not a feature we finished. It is part of how we design and build, and this page is our honest account of where we are.',
        },
      ],
    },
    {
      id: 'conformance-status',
      title: 'Conformance status',
      blocks: [
        {
          type: 'paragraph',
          text: 'We measure this store against the Web Content Accessibility Guidelines (WCAG) 2.2 at level AA, the standard most accessibility laws refer to.',
        },
        {
          type: 'paragraph',
          text: 'This store is partially conformant with WCAG 2.2 level AA. "Partially conformant" means most of the store meets the standard, and some parts do not yet. The known gaps are listed below, and we are working through them.',
        },
      ],
    },
    {
      id: 'measures-we-take',
      title: 'What we do',
      blocks: [],
      subsections: [
        {
          id: 'design-and-build',
          title: 'Design and build',
          blocks: [
            {
              type: 'list',
              items: [
                'We build on an accessible component library, so keyboard behavior, focus management, and screen reader semantics come from 1 tested implementation rather than being reinvented per page',
                'We use real headings, lists, landmarks, buttons, and links, so assistive technology can describe the page correctly',
                'We check color contrast when we choose colors, not after',
                'We include accessibility in code review, and treat a regression as a bug rather than a nice-to-have',
              ],
            },
          ],
        },
        {
          id: 'testing',
          title: 'Testing',
          blocks: [
            {
              type: 'paragraph',
              text: 'We test with the keyboard alone, with browser zoom, in both color themes, and with automated checks in our build. We also test the buying path, from search through checkout, with a screen reader.',
            },
            {
              type: 'paragraph',
              text: 'Automated tools catch only part of what matters, so they support our manual testing rather than replace it.',
            },
          ],
        },
      ],
    },
    {
      id: 'features',
      title: 'What this store already does',
      blocks: [],
      subsections: [
        {
          id: 'keyboard',
          title: 'Keyboard',
          blocks: [
            {
              type: 'paragraph',
              text: 'Every control can be reached and operated with the keyboard alone, in an order that follows the page. Menus, dialogs, and drawers trap focus while they are open, close on Escape, and return focus to whatever opened them. Focus is always visible.',
            },
          ],
        },
        {
          id: 'screen-readers',
          title: 'Screen readers',
          blocks: [
            {
              type: 'paragraph',
              text: 'Images carry alternative text, form fields carry labels, and errors are announced and linked to the field they belong to. Buttons that show only an icon carry a text label for assistive technology. Content that updates without a page load, such as a cart count or a filtered product grid, is announced.',
            },
          ],
        },
        {
          id: 'color-and-contrast',
          title: 'Color, contrast, and themes',
          blocks: [
            {
              type: 'paragraph',
              text: 'Text and interface colors are chosen to meet WCAG AA contrast in both the light and dark themes, and you can switch between them at any time. We never use color as the only way of telling you something: a price change, an error, or an out-of-stock product also carries text or an icon.',
            },
          ],
        },
        {
          id: 'motion',
          title: 'Motion',
          blocks: [
            {
              type: 'paragraph',
              text: 'If your system asks for reduced motion, the store honors it: carousels stop advancing on their own, parallax and reveal effects are removed, and transitions are shortened or dropped. Nothing flashes more than 3 times a second.',
            },
          ],
        },
        {
          id: 'text-and-zoom',
          title: 'Text and zoom',
          blocks: [
            {
              type: 'paragraph',
              text: 'The layout reflows down to a 320px-wide viewport and up to 400% browser zoom without losing content or needing you to scroll in 2 directions. Text can be resized without breaking the page, and nothing important is baked into an image of text.',
            },
          ],
        },
      ],
    },
    {
      id: 'known-limitations',
      title: 'Known limitations',
      blocks: [
        {
          type: 'paragraph',
          text: 'We would rather name these than leave you to discover them:',
        },
        {
          type: 'list',
          items: [
            'Some product images supplied by manufacturers have brief alternative text, and a few product photos of packaging contain text we have not yet transcribed',
            'Customer-uploaded review photos have no alternative text, because the people who upload them do not write any',
            'A small number of third-party components, such as embedded payment fields and delivery maps, are outside our control and may not fully meet the standard',
            'Some older PDF documents, such as archived manuals, are not tagged for screen readers',
          ],
        },
        {
          type: 'paragraph',
          text: 'If one of these stops you doing something, contact us and we will give you the information another way while we fix it.',
        },
      ],
    },
    {
      id: 'compatibility',
      title: 'Compatibility',
      blocks: [
        {
          type: 'paragraph',
          text: 'The store is built for current versions of Chrome, Edge, Firefox, and Safari on desktop and mobile, used with the screen readers those platforms ship, including NVDA and JAWS on Windows, VoiceOver on macOS and iOS, and TalkBack on Android.',
        },
        {
          type: 'paragraph',
          text: 'It may work with older browsers and other assistive technology, but we do not test those combinations, so we cannot promise it.',
        },
      ],
    },
    {
      id: 'help-while-shopping',
      title: 'If you need a hand',
      blocks: [
        {
          type: 'paragraph',
          text: 'If any part of the store gets in your way, our team can take your order, look up a product, check stock, or arrange a return with you directly. Write to us and say what you need; there is no separate process and no extra cost.',
        },
      ],
    },
    {
      id: 'feedback',
      title: 'Feedback',
      blocks: [
        {
          type: 'paragraph',
          text: `Tell us when something does not work. Write to ${legalEntity.supportEmail} with the page you were on, what you were trying to do, and the browser and assistive technology you were using, if you know them. Any detail helps, and a rough description is plenty.`,
        },
        {
          type: 'paragraph',
          text: 'We aim to reply within 5 working days, and to tell you what we are going to do and roughly when.',
        },
      ],
    },
    {
      id: 'formal-complaints',
      title: 'If we do not get it right',
      blocks: [
        {
          type: 'paragraph',
          text: 'If you are not satisfied with our reply, ask us to escalate it and someone who was not involved will look again.',
        },
        {
          type: 'paragraph',
          text: 'You can also raise a complaint with the accessibility or equality body in your country. Shoppers in the European Union may contact the national enforcement body under the European Accessibility Act.',
        },
      ],
    },
    {
      id: 'assessment',
      title: 'How this statement was prepared',
      blocks: [
        {
          type: 'paragraph',
          text: 'This statement was prepared following a self-assessment of the store against WCAG 2.2 level AA, combining automated testing with manual keyboard and screen reader review.',
        },
        {
          type: 'paragraph',
          text: 'We review it whenever we make a significant change to the store, and at least once a year. The effective date under the title says when we last did.',
        },
      ],
    },
  ],
} satisfies LegalDocument
