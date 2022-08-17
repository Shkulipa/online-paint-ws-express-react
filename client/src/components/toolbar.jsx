import React from "react";
import canvasState from "../store/canvasState";
import "../styles/toolbar.scss";
import Brush from "../tools/brush";
import Line from "../tools/line";
import Rect from "../tools/rect";
import Circle from "../tools/circle";
import ToolState from "../store/toolState";
import toolState from "../store/toolState";
import Eraser from "../tools/eraser";

export default function Toolbar() {
  const changeColor = (e) => {
    toolState.setFillColor(e.target.value);
    toolState.setStrokeColor(e.target.value);
  };

  const download = () => {
    const dataURL = canvasState.canvas.toDataURL();
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = canvasState.sessionId + '.jpg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  return (
    <div className="toolbar">
      <button
        className="toolbar__btn brush"
        onClick={() =>
          ToolState.setTool(
            new Brush(
              canvasState.canvas,
              canvasState.sessionId,
              canvasState.socket
            )
          )
        }
      />
      <button
        className="toolbar__btn rect"
        onClick={() =>
          ToolState.setTool(
            new Rect(
              canvasState.canvas,
              canvasState.sessionId,
              canvasState.socket
            )
          )
        }
      />
      <button
        className="toolbar__btn circle"
        onClick={() => ToolState.setTool(new Circle(canvasState.canvas))}
      />
      <button
        className="toolbar__btn eraser"
        onClick={() => ToolState.setTool(new Eraser(canvasState.canvas))}
      />
      <button
        className="toolbar__btn line"
        onClick={() => ToolState.setTool(new Line(canvasState.canvas))}
      />
      <input onChange={changeColor} style={{marginLeft: "10px"}} type="color" />
      <button
        className="toolbar__btn undo"
        onClick={() => canvasState.undo()}
      />
      <button
        className="toolbar__btn redo"
        onClick={() => canvasState.redo()}
      />
      <button className="toolbar__btn save" onClick={() => download()} />
    </div>
  );
}
