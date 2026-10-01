import {defineField, defineType} from 'sanity'

export const caseType = defineType({
  name: 'case',
  title: 'Case',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'manufacturer',
      title: 'Manufacturer',
      type: 'reference',
      to: [{type: 'manufacturer'}],
    }),
    defineField({
      name: 'hp',
      title: 'Total HP',
      type: 'number',
    }),
    defineField({
      name: 'maxDepthMM',
      title: 'Max Depth (mm)',
      type: 'number',
    }),
    defineField({
      name: 'powerCapacityPlus12',
      title: 'Power Capacity +12V (mA)',
      type: 'number',
    }),
    defineField({
      name: 'powerCapacityMinus12',
      title: 'Power Capacity -12V (mA)',
      type: 'number',
    }),
    defineField({
      name: 'powerCapacity5V',
      title: 'Power Capacity +5V (mA)',
      type: 'number',
    }),
    defineField({
      name: 'busBoardType',
      title: 'Bus Board Type',
      type: 'string',
    }),
    defineField({
      name: 'sourceURL',
      title: 'Source URL',
      type: 'url',
    }),
    defineField({
      name: 'revision',
      title: 'Revision',
      type: 'string',
    }),
  ],
})
