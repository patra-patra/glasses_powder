from flask import Flask, render_template
from backend.app.models.utils import get_all_products

app = Flask(__name__,
            static_folder="backend/app/static",
            template_folder="backend/app/templates")

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/api/products")
def products():
    return {"products": get_all_products()}
