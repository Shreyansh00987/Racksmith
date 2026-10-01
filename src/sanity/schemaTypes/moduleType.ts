import {defineField, defineType} from 'sanity'

export const moduleType = defineType({
  name: 'module',
  title: 'Module',
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
      title: 'HP Width',
      type: 'number',
    }),
    defineField({
      name: 'depthMM',
      title: 'Depth (mm)',
      type: 'number',
    }),
    defineField({
      name: 'widthMM',
      title: 'Width (mm)',
      type: 'number',
    }),
    defineField({
      name: 'powerPlus12',
      title: 'Power +12V (mA)',
      type: 'number',
    }),
    defineField({
      name: 'powerMinus12',
      title: 'Power -12V (mA)',
      type: 'number',
    }),
    defineField({
      name: 'power5V',
      title: 'Power +5V (mA)',
      type: 'number',
    }),
    defineField({
      name: 'connectorType',
      title: 'Connector Type',
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
    defineField({
      name: 'releaseDate',
      title: 'Release Date',
      type: 'date',
    }),
  ],
})
