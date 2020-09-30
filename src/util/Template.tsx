import StringTemplate from 'string-template'

const Template = {
  replace: (s: string, o: object): string => {
    return StringTemplate(s, o)
  }
}

export default Template