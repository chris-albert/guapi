import React from "react";
import { Dropdown, Card, Button, Form as ReactForm } from "react-bootstrap";
import * as t from 'io-ts'
import { Field } from '../data/Types'
import { LinkContainer } from "react-router-bootstrap"
import _ from "lodash";
import FormField from "./FormField";

type SettingsProps = {
  fields     : Array<t.TypeOf<typeof Field>>,
  setSettings: (obj: object) => void
}

const Settings = (props: SettingsProps) => {

  const [fields, setFields] = React.useState<object>(() => {
    const s = _.fromPairs(_.map(props.fields, field => {
      return [field.name, field.value]
    }))
    props.setSettings(s)
    return s
  })

  const fieldChanged = (key: string, value: any) => {
    const s = _.set(fields, key, value)
    setFields(s)
    props.setSettings(s)
  }

  return (
    <Dropdown drop="left">
      <Dropdown.Toggle variant="secondary" id="dropdown-basic" size="sm">
        Settings
      </Dropdown.Toggle>

      <Dropdown.Menu className="p-0" style={{width:400}}>
        <Card>
          <Card.Body>
            <ReactForm>
              {_.map(props.fields, field => (
                <FormField key={`form-field-settings-${field.name}`} field={field} onChange={fieldChanged}/>
              ))}
            </ReactForm>
          </Card.Body>
          <Card.Footer>
            <LinkContainer to="/config">
              <Button size="sm" className="float-right">Config</Button>
            </LinkContainer>
          </Card.Footer>
        </Card>
      </Dropdown.Menu>
    </Dropdown>
  )
}

export default Settings