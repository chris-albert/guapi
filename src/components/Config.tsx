import React from "react";
import {Card, Button, Container, Row, Col, Form as ReactForm} from "react-bootstrap";
import JsonEditor from "./JsonEditor";
import { StorageKey } from '../util/Storage'
import { Config as ConfigType, Field } from "../data/Types"
import _ from "lodash";
import ConfigProvider from "../data/ConfigProvider";
import { isRight } from "fp-ts/Either";
import FormField from "./FormField";
import * as t from 'io-ts'
import SettingsRepository from "../data/SettingsRepository";

const storage = StorageKey("config")

const Config = () => {

  const [settings, setSettings] = React.useState<object>(() => {
    const s = ConfigProvider.config()
    const fields = isRight(s) ?
      (_.isUndefined(s.right.settings) ? [] : s.right.settings) : []

    return _.fromPairs(_.map(fields, field => {
      return [field.name, field.value]
    }))
  })

  const [fields] = React.useState<Array<t.TypeOf<typeof Field>>>(() => {
    const settings = SettingsRepository.get()
    const s = ConfigProvider.config()
    const res = isRight(s) ?
      (_.isUndefined(s.right.settings) ? [] : s.right.settings) : []
    return _.map(res, field => {
      return _.set(field, 'value', _.get(settings, field.name))
    })
  })

  const fieldChanged = (key: string, value: any) => {
    const s = _.set(settings, key, value)
    setSettings(s)
    SettingsRepository.set(key, value)
  }

  const [content, setContent] = React.useState<string>(storage.getOrEmpty())

  const save = () => {
    storage.save(content)
    const result = ConfigType.decode(JSON.parse(content))

    if(isRight(result)) {
      console.log("Success")
    } else {
      console.error(result)
    }
  }

  const onChange = (content: string): void => {
    setContent(content)
    storage.save(content)
  }

  return (
    <Container fluid>
      <Row>
        <Col>
          <Card>
            <Card.Header>GUAPI Config</Card.Header>
            <Card.Body className="p-0">
              <JsonEditor content={content} readOnly={false} onChange={onChange}/>
            </Card.Body>
            <Card.Footer>
              <Button variant="success" size="sm" onClick={save}>Save</Button>{' '}
              <Button variant="info" size="sm" onClick={() => window.location.reload()}>Refresh</Button>
            </Card.Footer>
          </Card>
        </Col>
        <Col>
          <Card>
            <Card.Header>Settings</Card.Header>
            <Card.Body>
              <ReactForm>
                {_.map(fields, field => (
                  <FormField
                    key={`form-field-settings-${field.name}`}
                    field={field}
                    onChange={fieldChanged}
                  />
                ))}
              </ReactForm>
            </Card.Body>
            <Card.Footer>
              <Button variant="info" size="sm" onClick={() => window.location.reload()}>Refresh</Button>
            </Card.Footer>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default Config