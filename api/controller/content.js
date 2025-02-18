const { db } = require("../firebase-config");
const { assignDueDate } = require("../utils");

async function getAllContents(req, res) {
  try {
    let data = [];
    const response = await db.collection("contents").get();
    response.forEach((doc) => {
      data.push(doc.id, "=>", doc.data());
    });
    if (!data) {
      res.status(204).json({ status: "No Contents" });
    }
    res.status(200).json({ status: "Success", contents: data });
  } catch (error) {
    res
      .status(500)
      .json({ status: "Internal Server Error", error: error.message });
  }
} // get all content

async function addContent(req, res) {
  try {
    const { title, brand, platform, payment } = req.body;
    if (!title || !brand || !platform || !payment) {
      throw new Error(
        "Missing required fields: title, brand, platform, and/or payment"
      );
    }
    const status = "unassigned";
    const dueDate = assignDueDate(); // due date = 1 week after today
    await db
      .collection("contents")
      .add({ title, brand, platform, payment, status, dueDate });
    res.status(200).json({
      status: "Success",
      content: { title, brand, platform, payment, status, dueDate },
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: "Internal Server Error", error: error.message });
  }
} // add new content to manage

module.exports = { getAllContents, addContent };
