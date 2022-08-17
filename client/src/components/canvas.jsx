import {observer} from "mobx-react-lite";
import {useEffect, useRef, useState} from "react";
import canvasState from "../store/canvasState";
import ToolState from "../store/toolState";
import Button from "react-bootstrap/Button";
import "../styles/canvas.scss";
import Brush from "../tools/brush";
import Rect from "../tools/rect";
import Modal from "react-bootstrap/Modal";
import {useParams} from "react-router-dom";
import axios from "axios";

function Canvas() {
  const canvasRef = useRef();
  const usernameRef = useRef();
  const params = useParams();

  const [modal, setModal] = useState(true);

  useEffect(() => {
    if (canvasRef.current) {
      canvasState.setCanvas(canvasRef.current);
      axios.get(`http://localhost:5000/image?id=${params.id}`).then((res) => {
        const img = new Image();
        img.src = res.data;
        img.onload = () => {
          const ctx = canvasRef.current.getContext('2d');
          ctx.clearRect(
            0,
            0,
            canvasRef.current.width,
            canvasRef.current.height
          );
          ctx.drawImage(
            img,
            0,
            0,
            canvasRef.current.width,
            canvasRef.current.height
          );
        };
      });
    }
  }, []);

  useEffect(() => {
    if (canvasState.username) {
      // docs: https://learn.javascript.ru/websocket

      const socket = new WebSocket("ws://localhost:5000/");
      canvasState.setSocket(socket);
      canvasState.setSessionId(params.id);
      ToolState.setTool(new Brush(canvasRef.current, params.id, socket));

      socket.onopen = () => {
        socket.send(
          JSON.stringify({
            id: params.id,
            username: canvasState.username,
            method: "connection",
          })
        );
      };

      socket.onmessage = (event) => {
        let data = JSON.parse(event.data);

        switch (data.method) {
          case "connection":
            console.log(data.msg);
            break;

          case "draw":
            drawHandler(data);
            break;

          case "disconnectUser":
            console.log(data.msg);
            break;

          default:
            console.error(
              `a method: ${data.method},  isn't in switch on client side`
            );
            break;
        }
      };

      socket.onerror = (error) => {
        alert(`[error] ${error.message}`);
      };

      window.addEventListener("beforeunload", (e) => {
        e.preventDefault();
        const data = JSON.stringify({
          id: params.id,
          username: canvasState.username,
        });
        socket.close(1000, data);
      });

      return () => {
        window.removeEventListener("beforeunload", "delete listener");
      };
    }
  }, [canvasState.username]);

  const drawHandler = (data) => {
    const figure = data.figure;
    const ctx = canvasRef.current.getContext("2d");
    switch (figure.type) {
      case "brush":
        Brush.draw(ctx, figure.x, figure.y);
        break;
      case "rect":
        Rect.staticDraw(
          ctx,
          figure.x,
          figure.y,
          figure.width,
          figure.height,
          figure.color
        );
        break;
      case "finish":
        ctx.beginPath();
        break;
      default:
        break;
    }
  };

  const mouseDownHandler = () => {
    canvasState.pushToUndo(canvasRef.current.toDataURL());
  };

  const mouseUpHandler = () => {
    canvasState.pushToUndo(canvasRef.current.toDataURL());
    axios
      .post(`http://localhost:5000/image?id=${params.id}`, {
        img: canvasRef.current.toDataURL(),
      })
      .then((res) => console.log(res.data));
  };

  const connectHandler = () => {
    canvasState.setUsername(usernameRef.current.value);
    setModal(false);
  };

  return (
    <div className="canvas">
      <Modal show={modal} onHide={() => {}}>
        <Modal.Header closeButton>
          <Modal.Title>Enter you name...</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <input type="text" ref={usernameRef} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => connectHandler()}>
            Join
          </Button>
        </Modal.Footer>
      </Modal>

      <canvas
        onMouseDown={() => mouseDownHandler()}
        onMouseUp={() => mouseUpHandler()}
        ref={canvasRef}
        width={600}
        height={400}
      />
    </div>
  );
}

export default observer(Canvas);
