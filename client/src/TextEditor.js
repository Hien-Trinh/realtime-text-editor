import { useEffect, useState } from "react"
import ReactQuill from "react-quill"
import "react-quill/dist/quill.snow.css"
import { useParams } from "react-router-dom"
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
const SAVE_INTERVAL = 2000

export default function TextEditor() {
    const [value, setValue] = useState()
    const [editor, setEditor] = useState()
    const [socket, setSocket] = useState()
    const { id: documentId } = useParams()

    useEffect(() => {
        const socketInstance = io("http://localhost:3001")
        setSocket(socketInstance)

        return () => {
            socketInstance.disconnect()
        }
    }, [])

    useEffect(() => {
        if (socket == null) return
        socket.once("load-document", (document) => {
            setValue(document)
        })

        socket.emit("get-document", documentId)
    }, [socket, documentId])

    useEffect(() => {
        if (socket == null || editor == null) return
        const interval = setInterval(() => {
            socket.emit("save-document", editor.getContents())
        }, SAVE_INTERVAL)

        return () => {
            clearInterval(interval)
        }
    }, [socket, editor])

    useEffect(() => {
        if (socket == null) return
        socket.on("receive-changes", (delta) => {
            setValue(delta)
        })

        return () => {
            socket.off("receive-changes")
        }
    }, [socket, value])

    const handleChange = (content, delta, source, editor) => {
        if (socket == null || source !== "user") return

        setEditor(editor)
        socket.emit("send-changes", editor.getContents())
    }

    return (
        <div className="container">
            <ReactQuill
                theme="snow"
                modules={MODULES}
                value={value}
                onChange={(content, delta, source, editor) =>
                    handleChange(content, delta, source, editor)
                }
            />
        </div>
    )
}
