import React from "react";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/mode-json";

interface JsonEditorProps {
  content : string,
  readOnly: boolean,
  onChange: (value: string) => void
}

const JsonEditor = (props: JsonEditorProps) => {
  return (
    <div className="json-block">
      <AceEditor
        value={props.content}
        mode="json"
        theme="monokai"
        fontSize={14}
        readOnly={props.readOnly}
        maxLines={Infinity}
        width="100%"
        showPrintMargin={true}
        showGutter={true}
        highlightActiveLine={true}
        onChange={v => props.onChange(v)}
        setOptions={{
          enableBasicAutocompletion: false,
          enableLiveAutocompletion: false,
          enableSnippets: false,
          showLineNumbers: true,
          tabSize: 2,
        }}
      />
    </div>
  );
}

export default JsonEditor;