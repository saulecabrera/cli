import {TemplateSpecification} from '../../app/template.js'

/**
 * Tax Calculation UI extension template specification.
 */
const taxCalculationUIExtension: TemplateSpecification = {
  identifier: 'tax_calculation',
  name: 'Tax Calculation',
  group: 'Merchant admin',
  supportLinks: [],
  types: [
    {
      url: 'https://github.com/Shopify/cli',
      type: 'tax_calculation',
      extensionPoints: [],
      supportedFlavors: [
        {
          name: 'Config only',
          value: 'config-only',
          path: 'packages/app/templates/ui-extensions/projects/tax_calculation',
        },
      ],
    },
  ],
}

export default taxCalculationUIExtension
