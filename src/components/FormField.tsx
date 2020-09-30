import React from "react";
import * as t from 'io-ts'
import { Field } from "../data/Types"
import {Form as ReactForm } from "react-bootstrap";

type StringFieldProps = {
  field   : t.TypeOf<typeof Field>,
  onChange: (s: any) => void
}

const StringField = (props: StringFieldProps) => {

  const [value, setValue] = React.useState<string>(typeof props.field.value === "string" ? props.field.value : "")

  const onChange = (s: string): void => {
    setValue(s)
    props.onChange(s)
  }

  return (
    <ReactForm.Group controlId={`form-basic-${props.field.name}`}>
      <ReactForm.Label>{props.field.display}</ReactForm.Label>
      <ReactForm.Control type="input" onChange={e => onChange(e.target.value)} value={value}/>
    </ReactForm.Group>
  )
}

type FormFieldProps = {
  field   : t.TypeOf<typeof Field>,
  onChange: (key: string, value: any) => void
}

const FormField = (props: FormFieldProps) => {
  if(props.field.type === "string") {
    return (
      <StringField field={props.field} onChange={a => props.onChange(props.field.name, a)}/>
    )
  } else {
    return (
      <div>Unknown field</div>
    )
  }
}

export default FormField