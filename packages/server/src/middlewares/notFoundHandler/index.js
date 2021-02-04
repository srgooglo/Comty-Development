export const notFoundHandler = (req, res, next) => {
    res.status(404).json({ error: "endpoint not found" })
}

export default notFoundHandler