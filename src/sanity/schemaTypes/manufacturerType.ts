import {defineField, defineType} from 'sanity'

export const manufacturerType = defineType({
  name: 'manufacturer',
  title: 'Manufacturer',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'website',
      title: 'Website',
      type: 'url',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
    defineField({
      name: 'sourceReferences',
      title: 'Source References',
      type: 'array',
      of: [{type: 'url'}],
    }),
  ],
})
