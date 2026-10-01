import {defineField, defineType} from 'sanity'

export const contradictionType = defineType({
  name: 'contradiction',
  title: 'Contradiction',
  type: 'document',
  fields: [
    defineField({
      name: 'claimA',
      title: 'Claim A',
      type: 'reference',
      to: [{type: 'claim'}],
    }),
    defineField({
      name: 'claimB',
      title: 'Claim B',
      type: 'reference',
      to: [{type: 'claim'}],
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: ['unresolved', 'resolved'],
      },
    }),
    defineField({
      name: 'explanation',
      title: 'Explanation',
      type: 'text',
    }),
    defineField({
      name: 'resolution',
      title: 'Resolution Notes',
      type: 'text',
    }),
    defineField({
      name: 'resolvedBy',
      title: 'Resolved By',
      type: 'string',
    }),
    defineField({
      name: 'resolvedAt',
      title: 'Resolved At',
      type: 'datetime',
    }),
  ],
})
