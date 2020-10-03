import React from "react";
import { FormItem } from "../data/Types"
import * as t from 'io-ts'
import { Card, Form as ReactForm, Button, Spinner } from "react-bootstrap";
import _ from "lodash";
import FormField from "./FormField";

type FormProps = {
  form        : t.TypeOf<typeof FormItem>,
  fields      : object,
  fieldChanged: (key: string, value: any) => void,
  onSubmit    : () => void,
  loading     : boolean
}

const Form = (props: FormProps) => {

  return (
    <Card>
      <Card.Header>Form</Card.Header>
      <Card.Body>
        <ReactForm>
          {_.map(props.form.form.request.fields, field => (
            <FormField key={`form-field-${field.name}`} field={field} onChange={props.fieldChanged}/>
          ))}
        </ReactForm>
      </Card.Body>
      <Card.Footer>
        <Button
          className="pull-right"
          variant="primary"
          type="submit"
          size="sm"
          disabled={props.loading}
          onClick={() => props.loading ? null : props.onSubmit()}
        >
          {props.loading ?
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
            /> :
            <span>Submit</span>
          }

        </Button>
      </Card.Footer>
    </Card>
  )
}

export default Form