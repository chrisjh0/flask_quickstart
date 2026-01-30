from flask import Flask, render_template

app = Flask(__name__)


@app.route('/')
def hello():
    return render_template('profile.html')

@app.route('/clicker')
def a():
    return render_template('clicker.html')

if __name__ == '__main__':
    app.run(debug=True)
