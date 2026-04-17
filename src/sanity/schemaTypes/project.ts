import { defineField, defineType } from 'sanity'

export const project = defineType({
  name: 'project',
  title: 'Construction Project',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Project Name',
      type: 'object',
      fields: [
        { name: 'en', type: 'string', title: 'English' },
        { name: 'ar', type: 'string', title: 'Arabic' },
        { name: 'ru', type: 'string', title: 'Russian' }
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name.en',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Cement', value: 'cement' },
          { title: 'Bricks', value: 'bricks' },
          { title: 'Steel', value: 'steel' },
          { title: 'Paint', value: 'paint' },
          { title: 'Tools', value: 'tools' }
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Planning', value: 'planning' },
          { title: 'In Progress', value: 'in-progress' },
          { title: 'Completed', value: 'completed' }
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'price',
      title: 'Price (KGS)',
      type: 'number',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'object',
      fields: [
        { name: 'en', type: 'text', title: 'English' },
        { name: 'ar', type: 'text', title: 'Arabic' },
        { name: 'ru', type: 'text', title: 'Russian' }
      ]
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    }),
  ],
})
