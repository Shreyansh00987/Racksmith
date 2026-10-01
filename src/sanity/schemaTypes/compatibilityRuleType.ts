import {defineField, defineType} from 'sanity'

export const compatibilityRuleType = defineType({
  name: 'compatibilityRule',
  title: 'Compatibility Rule',
  type: 'document',
  fields: [
    defineField({
      name: 'module',
      title: 'Module',
      type: 'reference',
      to: [{type: 'module'}],
    }),
    defineField({
      name: 'case',
      title: 'Case',
      type: 'reference',
      to: [{type: 'case'}],
    }),
    defineField({
      name: 'clearanceRequired',
      title: 'Clearance Required (mm)',
      type: 'number',
    }),
    defineField({
      name: 'powerConstraints',
      title: 'Power Constraints Notes',
      type: 'text',
    }),
    defineField({
      name: 'notes',
      title: 'Notes',
      type: 'text',
    }),
    defineField({
      name: 'source',
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
