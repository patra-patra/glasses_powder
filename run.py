import os
from flask import Flask, render_template
from backend.app.models.utils import get_all_products

BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # папка glasses_powder/

app = Flask(
    __name__,
    static_folder=os.path.join(BASE_DIR, "backend", "app", "static"),
    template_folder=os.path.join(BASE_DIR, "backend", "app", "templates")
)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/api/products")
def products():
    return {"products": get_all_products()}
