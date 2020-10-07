import * as t from 'io-ts'
import { withFallback } from 'io-ts-types/lib/withFallback'
import { option } from 'io-ts-types/lib/option'
import { none } from 'fp-ts/Option'

export const FormLocation = t.union([
  t.literal("query"),
  t.literal("body")
])

export const FormMethod = t.union([
  t.literal("get"),
  t.literal("post"),
  t.literal("put"),
  t.literal("delete")
])


export const FieldCommon = {
  display : t.string,
  name    : t.string,
  required: withFallback(t.boolean, true)
}

export const DateField = t.type({
  ...FieldCommon,
  type    : t.literal("date"),
  format  : t.string,
  value   : t.union([t.string, t.undefined]),
  generate: t.union([t.boolean, t.undefined])
})

export const SelectItem = t.type({
  display: t.string,
  name   : t.string,
})

export const SelectMultiField = t.type({
  ...FieldCommon,
  type     : t.literal("select-multi"),
  items    : t.array(SelectItem),
  value    : t.union([t.array(t.string), t.undefined]),
  creatable: withFallback(t.boolean, true),
  generate : t.union([t.boolean, t.undefined])
})

export const SelectField = t.type({
  ...FieldCommon,
  type     : t.literal("select"),
  items    : t.array(SelectItem),
  value    : t.union([t.string, t.undefined]),
  creatable: withFallback(t.boolean, true),
  generate : t.union([t.boolean, t.undefined])
})

export const BooleanField = t.type({
  ...FieldCommon,
  type    : t.literal("boolean"),
  value   : t.union([t.boolean, t.undefined]),
  generate: t.union([t.boolean, t.undefined])
})

export const NumberField = t.type({
  ...FieldCommon,
  type    : t.literal("number"),
  value   : t.union([t.number, t.undefined]),
  generate: t.union([
    t.type({
      min      : t.number,
      max      : t.number,
      precision: t.number
    }),
    t.boolean,
    t.undefined
  ])
})

export const StringField = t.type({
  ...FieldCommon,
  type    : t.literal("string"),
  value   : t.union([t.string, t.undefined]),
  generate: withFallback(
    t.union([
      t.boolean,
      t.number,
      t.literal("name")
    ]),
    true
  )
})

export const Field = t.union([
  StringField,
  NumberField,
  BooleanField,
  SelectField,
  SelectMultiField,
  DateField
])

export const Request = t.type({
  url     : t.string,
  path    : t.string,
  location: FormLocation,
  method  : FormMethod,
  fields  : t.array(Field),
  root    : t.union([t.string, t.undefined])
})

export const Form = t.type({
  request: Request
})

export const FormItem = t.type({
  display: t.string,
  name   : t.string,
  form   : Form
})

interface NavItem {
  display: string,
  name   : string,
  nav    : Array<Item>
}

type Item = t.TypeOf<typeof FormItem> | NavItem

export const NavItem: t.Type<NavItem> = t.recursion('NavItem', () =>
  t.type({
    display: t.string,
    name   : t.string,
    nav    : t.array(Item)
  })
)

export const Item = t.union([FormItem, NavItem])

export const Config = t.type({
  display : t.string,
  icon    : t.union([t.string, t.undefined]),
  settings: t.union([t.array(Field), t.undefined]),
  nav     : t.array(Item)
})