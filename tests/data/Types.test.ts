import { expect } from 'chai';
import 'mocha';

import { ArrayField } from "../../src/data/Types"

describe('ArrayField test', () => {
  it('should parse an array of string', () => {

    const obj: object = {
      "display" : "Some Array",
      "name"    : "someArray",
      "type"    : "array(string)",
      "values"  : ["a", "b", "c"],
      "generate": "name"
    }

    const res = ArrayField.decode(obj)
    console.log(res)

    expect("hi").to.equal('hi');
  });
});