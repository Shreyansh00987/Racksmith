import {defineField, defineType} from 'sanity'

export const claimType = defineType({
  name: 'claim',
  title: 'Claim',
  type: 'document',
  fields: [
    defineField({
      name: 'statement',
      title: 'Statement',
      type: 'string',
    }),
    defineField({
      name: 'entityId',
      title: 'Entity ID',
      type: 'string',
      description: 'The Sanity document ID this claim is about',
    }),
    defineField({
      name: 'entityType',
      title: 'Entity Type',
      type: 'string',
    }),
    defineField({
      name: 'field',
      title: 'Field',
      type: 'string',
      description: 'The field this claim is about (e.g., powerPlus12)',
    }),
    defineField({
      name: 'value',
      title: 'Value',
      type: 'string',
    }),
    defineField({
      name: 'source',
      title: 'Source URL/Reference',
      type: 'string',
    }),
    defineField({
      name: 'confidence',
      title: 'Confidence Level',
      type: 'number',
      description: '0 to 100',
    }),
    defineField({
      name: 'timestamp',
      title: 'Timestamp',
      type: 'datetime',
    }),
    defineField({
      name: 'revision',
      title: 'Revision',
      type: 'string',
    }),
    defineField({
      name: 'context',
      title: 'Context Notes',
      type: 'text',
    }),
  ],
})
