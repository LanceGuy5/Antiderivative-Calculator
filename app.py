import sympy as sp
from sympy.integrals.risch import risch_integrate
from flask import Flask, render_template, request, jsonify
import json

app = Flask(__name__)

x = sp.Symbol('x')


@app.route('/')
def index():
    return render_template('index.html')


# TODO Add compatibility for absolute value
@app.route('/process_input', methods=['POST', 'GET'])
def integrate():
    if request.method == "POST":
        unedited = request.get_json()
        func = define_function(unedited)
        parsed_func = parse(func)
        print("Parsed: " + parsed_func)
        integral = sp.integrate(parsed_func, x)
        integral.doit()
        integral = sp.simplify(integral)
        integral = sp.fu(integral)
        # get_graph(parsed_func, integral)
        # integral = risch_integrate(parsed_func, x)
        # integral.doit()
        results = {
            'processed': 'true',
            'result': reverse_parse(sp.sstr(integral))
            }
        return jsonify(results)
    else:
        results = {
            'processed': 'false'
        }
        return jsonify(results)


def define_function(js):
    edited = json.dumps(js)
    begin = 11
    curr = 11
    while edited[curr] != '\"':
        curr = curr + 1

    return edited[begin:curr]


def parse(func: str):
    i = 0
    while i < len(func):
        if func[i] == '^':
            func = func[0:i] + "**" + func[i+1:]
            i = 0
        else:
            i += 1

    k = 0

    while k < len(func):
        if func[k] == 'e' and func[k - 1:k + 2] != "sec":
            print(func[k-1:k+1])
            func = func[0:k] + "E" + func[k+1:]
            k = 0
        else:
            k += 1

    return func


def reverse_parse(func: str):
    i = 0
    while i < len(func) - 1:
        if func[i:i+2] == "**":
            func = func[0:i] + "^" + func[i+2:]
            i = 0
        else:
            i += 1

    func = func.replace("E", "e")
    func = func.replace("log", "ln")
    func = func.replace("exp", "e^")

    return func


def get_graph(original: str, integral: str):
    p1 = sp.plot(integral, show=False)
    p1.title = "Original vs. Integral"
    p1.xlim = range(-20, 20)
    p1.ylim = range(-20, 20)
    p1.show()


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
