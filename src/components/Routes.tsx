import React from "react";
import {HashRouter, Switch, Route} from 'react-router-dom'
import {Navbar, Nav, Row, Col, Container} from "react-bootstrap";
import {LinkContainer} from "react-router-bootstrap"
import Config from "./Config";
import ConfigProvider from "../data/ConfigProvider";
import { isRight } from "fp-ts/Either";
import _ from 'lodash'
import ConfigError from "./ConfigError";
import Form from "./Form";

const Routes = () => {

  const config = ConfigProvider.config()

  const configLinks = isRight(config) ?
    _.map(config.right.forms, form => (
      <LinkContainer to={`/${form.name}`}>
        <Nav.Link>{form.display}</Nav.Link>
      </LinkContainer>
    )) :
    (
      <LinkContainer to={`/error`}>
        <Nav.Link>Error</Nav.Link>
      </LinkContainer>
    )

  const configRoutes = isRight(config) ?
    _.map(config.right.forms, form => (
      <Route path={`/${form.name}`}>
        <Form form={form} />
      </Route>
    )) :
    (
      <Route path="/error">
        <ConfigError errors={config.left} />
      </Route>
    )

  return (
    <HashRouter>
      <Navbar bg="dark" variant="dark">
        <Navbar.Brand href="#home">GUAPI</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav"/>
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            <LinkContainer to="/config">
              <Nav.Link>Config</Nav.Link>
            </LinkContainer>
            {configLinks}
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      <Switch>
        <Container fluid className="mt-3">
          <Row>
            <Col>
              <Route path="/config">
                <Config />
              </Route>
              {configRoutes}
            </Col>
          </Row>
        </Container>
      </Switch>
    </HashRouter>
  )
}

export default Routes