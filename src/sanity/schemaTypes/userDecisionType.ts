import {defineField, defineType} from 'sanity'

export const userDecisionType = defineType({
  name: 'userDecision',
  title: 'User Decision',
  type: 'document',
  fields: [
    defineField({
      name: 'chosenClaim',
      title: 'Chosen Claim',
      type: 'reference',
      to: [{type: 'claim'}],
    }),
    defineField({
      name: 'rationale',
      title: 'Rationale',
      type: 'text',
    }),
    defineField({
      name: 'context',
      title: 'Context',
      type: 'string',
    }),
    defineField({
      name: 'active',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
    }),
  ],
})
