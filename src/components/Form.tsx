import React from "react";
import { Form as FormType } from "../data/Types"
import * as t from 'io-ts'
import { Card, Form as ReactForm, Button } from "react-bootstrap";
import _ from "lodash";
import FormField from "./FormField";
import template from 'es6-dynamic-template'

type FormProps = {
  form: t.TypeOf<typeof FormType>
}

const Form = (props: FormProps) => {

  const [fields, setFields] = React.useState<object>(
    _.fromPairs(_.map(props.form.fields, field => {
      return [field.name, field.value]
    }))
  )

  const formChange = (key: string, value: any): void => {
    setFields(_.set(fields, key, value))
  }

  const onSubmit = () => {
    console.log(fields)
    console.log(props.form.path)
    console.log(template(props.form.path, fields))
  }

  return (
    <Card>
      <Card.Header>{props.form.display}</Card.Header>
      <Card.Body>
        <ReactForm>
          {_.map(props.form.fields, field => (
            <FormField key={`form-field-${field.name}`} field={field} onChange={formChange}/>
          ))}
          <Button variant="primary" type="submit" size="sm" onClick={onSubmit}>
            Submit
          </Button>
        </ReactForm>
      </Card.Body>
    </Card>
  )
}

export default Form