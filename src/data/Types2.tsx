import * as t from 'io-ts'

export const FieldType = t.union([
  t.literal("string"),
  t.literal("number")
])

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

export const Field = t.type({
  display    : t.string,
  name       : t.string,
  type       : FieldType,
  value      : t.unknown,
  placeholder: t.union([t.string, t.undefined])
})

export const Request = t.type({
  url     : t.string,
  path    : t.string,
  location: FormLocation,
  method  : FormMethod,
  fields  : t.array(Field)
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
  display: t.string,
  icon   : t.union([t.string, t.undefined]),
  nav    : t.array(Item)
})