import { useState, useEffect } from "react"
import ReactQuill from "react-quill"
import "react-quill/dist/quill.snow.css"
import { io } from "socket.io-client"

const TOOLBAR_OPTIONS = [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ font: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["bold", "italic", "underline"],
    [{ color: [] }, { background: [] }],
    [{ script: "sub" }, { script: "super" }],
    [{ align: [] }],
    ["image", "blockquote", "code-block"],
    ["clean"],
]
const MODULES = {
    toolbar: TOOLBAR_OPTIONS,
}

export default function TextEditor() {
    const [value, setValue] = useState("")
    const [socket, setSocket] = useState()

    useEffect(() => {
        const socketInstance = io("http://localhost:3001")
        setSocket(socketInstance)

        return () => {
            socketInstance.disconnect()
        }
    }, [])


    useEffect(() => {
        if (socket == null) return
        socket.on("receive-changes", delta => {
            setValue(delta)
        })

        return () => {
            socket.off("receive-changes")
        }
    }, [socket, value])

    const handleChange = (content, delta, source, editor) => {
        if (socket == null || source !== "user") return

        socket.emit("send-changes", editor.getContents())
    }

    return (
        <div className="container">
            <ReactQuill
                theme="snow"
                modules={MODULES}
                value={value}
                onChange={(content, delta, source, editor) => handleChange(content, delta, source, editor)}
            />
        </div>
    )
}
