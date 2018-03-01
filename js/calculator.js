window.onload = calculatorApp;

function calculatorApp() {

    var inputDisplay = document.getElementsByClassName('input')[0];
    var resultDisplay = document.getElementsByClassName('result')[0];
    var allButtons = document.getElementsByTagName('button');
    var deleteBtn = document.getElementById('delete');
    var resetBtn = document.getElementById('reset');
    var calculateBtn = document.getElementById('equals');

    var floatRegex = /^[-]?\d+\.?\d*$/;
    var intRegex = /^[-]?\d+$/;

    inputDisplay.innerHTML = "";
    inputDisplay.style.backgroundColor = '#000';
    inputDisplay.style.Color = '#fff';
    var tokens = ['0'];
    var Ans = 0;
    var flag = false;

    for (var i = 0; i < allButtons.length; i++) {
        if (allButtons[i].hasAttribute('name')) {
            allButtons[i].onclick = function () {
                var peek = this.name;
                if (flag) {
                    inputDisplay.innerHTML = "";
                    tokens = ['0'];
                    flag = false;
                    inputDisplay.style.backgroundColor = '#000';
                }
                inputDisplay.innerHTML += peek;
                if (((!isNaN(parseInt(peek)) || peek == '.' || peek == '-') && peek != "10^(")
                    && tokens.length > 0
                    && ((!isNaN(parseInt(tokens[tokens.length - 1])) || tokens[tokens.length - 1] == '.' || tokens[tokens.length - 1] == '-') && tokens[tokens.length - 1] != "10^(")) {
                    if (tokens.length == 1 && tokens[0] == '0' && peek == '-') {
                        tokens.pop();
                        tokens.push(peek);
                    } else {
                        var last = tokens.pop();
                        tokens.push(last + peek);
                    }
                } else {
                    if (tokens.length == 1 && tokens[0] == '0') {
                        tokens.pop();
                    }
                    tokens.push(peek);
                }
            };
        }
    }

    deleteBtn.onclick = function () {
        if (inputDisplay.innerHTML != "" && !flag) {
            var deleted = tokens.pop();
            if (deleted == "(") {
                inputDisplay.innerHTML = inputDisplay.innerHTML.slice(0, inputDisplay.innerHTML.length - 1);
            } else if ('^(, √('.indexOf(deleted) >= 0) {
                inputDisplay.innerHTML = inputDisplay.innerHTML.slice(0, inputDisplay.innerHTML.length - 2);
            } else if ('Ans, mod, e^(, ln('.indexOf(deleted) >= 0) {
                inputDisplay.innerHTML = inputDisplay.innerHTML.slice(0, inputDisplay.innerHTML.length - 3);
            } else if ('sin(, cos(, tan(, log(, 10^(, deg('.indexOf(deleted) >= 0) {
                inputDisplay.innerHTML = inputDisplay.innerHTML.slice(0, inputDisplay.innerHTML.length - 4);
            } else if ('asin(, acos(, atan('.indexOf(deleted) >= 0) {
                inputDisplay.innerHTML = inputDisplay.innerHTML.slice(0, inputDisplay.innerHTML.length - 5);
            } else if ('<sup>_</sup>'.indexOf(deleted) >= 0) {
                inputDisplay.innerHTML = inputDisplay.innerHTML.slice(0, inputDisplay.innerHTML.length - 12);
            } else if ('<sub>x10^</sub>'.indexOf(deleted) >= 0) {
                inputDisplay.innerHTML = inputDisplay.innerHTML.slice(0, inputDisplay.innerHTML.length - 15);
            } else {
                inputDisplay.innerHTML = inputDisplay.innerHTML.slice(0, inputDisplay.innerHTML.length - 1);
                if (!isNaN(parseInt(deleted)) && deleted.length > 1) {
                    tokens.push(deleted.slice(0, deleted.length - 1));
                }
            }
        }
    }

    resetBtn.onclick = function () {
        inputDisplay.innerHTML = "";
        resultDisplay.innerHTML = "";
        tokens = ['0'];
        flag = false;
        
        inputDisplay.style.backgroundColor = '#000';
    }

    calculateBtn.onclick = function () {
        var tokensEnumerator = MakeEnumerable(tokens).getEnumerator();
        function MakeEnumerable(items) {
            counter = -1;
            return {
                enumerator: {
                    moveNext: function () {
                        counter++;
                        return counter < items.length;
                    },
                    getCurrent: function () {
                        return items[counter];
                    }
                },
                getEnumerator: function () {
                    return this.enumerator;
                }
            };
        };
        var lookahead = tokensEnumerator.moveNext() ? tokensEnumerator.getCurrent() : "</>";
        var stack = [];
        try {
            Expr();
            // Ans = stack.pop();
            if (stack.length == 1 && lookahead == "</>") Ans = stack.pop(); else throw 'Syntax Error';
            resultDisplay.innerHTML = Ans;
        } catch (err) {
            resultDisplay.innerHTML = err;
        } finally {
            flag = true;
            inputDisplay.style.backgroundColor = '#000';
        }

        function Expr() {
            Term1();
            while (true) {
                if (lookahead == '+') {
                    Match('+');
                    Term1();
                    SolveBinary('+');
                }
                else if (lookahead == '<sup>_</sup>') {
                    Match('<sup>_</sup>');
                    Term1();
                    SolveBinary('<sup>_</sup>');
                }
                else return;
            }
        }

        function Term1() {
            Term2();
            while (true) {
                if (lookahead == '*') {
                    Match('*');
                    Term2();
                    SolveBinary('*');
                } else if (lookahead == '/') {
                    Match('/');
                    Term2();
                    SolveBinary('/');
                } else if (lookahead == 'mod') {
                    Match('mod');
                    Term2();
                    SolveBinary('mod');
                } else if (lookahead == '<sub>x10^</sub>') {
                    Match('<sub>x10^</sub>');
                    Term2();
                    SolveBinary('<sub>x10^</sub>');
                } else return;
            }
        }

        function Term2() {
            Factor();
            while (true) {
                if (lookahead == '^(') {
                    Match('^(');
                    Factor();
                    if (lookahead == ')') Match(')');
                    SolveBinary('^(');
                } else return;
            }
        }

        function Factor() {
            if ((floatRegex.test(lookahead) || lookahead == "Ans" || lookahead == 'π') && lookahead != "10^(") {
                var n;
                if (intRegex.test(lookahead)) n = parseInt(lookahead);
                else if (floatRegex.test(lookahead)) n = parseFloat(lookahead);
                else if (lookahead == 'π') n = Math.PI;
                else n = Ans;
                stack.push(n);
                Match(lookahead);
            }
            else if (lookahead == '(') {
                Match('(');
                Expr();
                if (lookahead == ')') Match(')');
            } else if (lookahead == '√(') {
                Match('√(');
                Expr();
                if (lookahead == ')') Match(')');
                SolveUnary('√(');
            } else if (lookahead == 'sin(') {
                Match('sin(');
                Expr();
                if (lookahead == ')') Match(')');
                SolveUnary('sin(');
            } else if (lookahead == 'cos(') {
                Match('cos(');
                Expr();
                if (lookahead == ')') Match(')');
                SolveUnary('cos(');
            } else if (lookahead == 'tan(') {
                Match('tan(');
                Expr();
                if (lookahead == ')') Match(')');
                SolveUnary('tan(');
            } else if (lookahead == 'asin(') {
                Match('asin(');
                Expr();
                if (lookahead == ')') Match(')');
                SolveUnary('asin(');
            } else if (lookahead == 'acos(') {
                Match('acos(');
                Expr();
                if (lookahead == ')') Match(')');
                SolveUnary('acos(');
            } else if (lookahead == 'atan(') {
                Match('atan(');
                Expr();
                if (lookahead == ')') Match(')');
                SolveUnary('atan(');
            } else if (lookahead == 'ln(') {
                Match('ln(');
                Expr();
                if (lookahead == ')') Match(')');
                SolveUnary('ln(');
            } else if (lookahead == 'log(') {
                Match('log(');
                Expr();
                if (lookahead == ')') Match(')');
                SolveUnary('log(');
            } else if (lookahead == '10^(') {
                Match('10^(');
                Expr();
                if (lookahead == ')') Match(')');
                SolveUnary('10^(');
            } else if (lookahead == 'e^(') {
                Match('e^(');
                Expr();
                if (lookahead == ')') Match(')');
                SolveUnary('e^(');
            } else if (lookahead == 'deg(') {
                Match('deg(');
                Expr();
                if (lookahead == ')') Match(')');
                SolveUnary('deg(');

            } else throw "Syntax Error";

            while (true) {
                if (lookahead == '!') {
                    Match('!');
                    SolveUnary('!');
                } else return;
            }
        }

        function Match(t) {
            if (lookahead == t) {
                lookahead = tokensEnumerator.moveNext() ? tokensEnumerator.getCurrent() : "</>";
            } else throw "Syntax Error";
        }

        function SolveBinary(operator) {
            var secondOperand = stack.pop();
            var firstOperand = stack.pop();
            var result;
            switch (operator) {
                case '+': result = firstOperand + secondOperand; break;
                case '<sup>_</sup>': result = firstOperand - secondOperand; break;
                case '*': result = firstOperand * secondOperand; break;
                case '/': result = firstOperand / secondOperand; break;
                case 'mod': result = firstOperand % secondOperand; break;
                case '^(': result = Math.pow(firstOperand, secondOperand); break;
                case '√(': result = Math.sqrt(firstOperand, secondOperand); break;
                case '<sub>x10^</sub>': result = firstOperand * Math.pow(10, secondOperand); break;
                default: throw 'Invalid Operator';
            }
            if (isFinite(result)) {
                stack.push(result);
            } else {
                throw 'Math Error';
            }
        }

        function SolveUnary(operator) {
            var operand = stack.pop();
            var result;
            switch (operator) {
                case '10^(': result = Math.pow(10, operand); break;
                case 'e^(': result = Math.exp(operand); break;
                case 'log(': result = Math.log10(operand); break;
                case 'ln(': result = Math.log(operand); break;
                case '√(': result = Math.sqrt(operand); break;
                case '!': result = Factorial(operand); break;
                case 'deg(': result = ConvertToDegrees(operand); break;
                case 'sin(': result = Math.sin(ConvertToRadian(operand)); break;
                case 'cos(': result = Math.cos(ConvertToRadian(operand)); break;
                case 'tan(': result = Math.tan(ConvertToRadian(operand)); break;
                case 'asin(': result = ConvertToDegrees(Math.asin(operand)); break;
                case 'acos(': result = ConvertToDegrees(Math.acos(operand)); break;
                case 'atan(': result = ConvertToDegrees(Math.atan(operand)); break;
                default: throw 'Invalid Operator';
            }
            if (isFinite(result)) {
                stack.push(result);
            } else {
                throw 'Math Error';
            }
        }

        function Factorial(n) {
            var sum = 1;
            if (typeof n == "number") {
                if (n == 0 || n == 1) return sum;
                else if (n < 0) throw 'Invalid Number';
                else {
                    for (var i = 2; i <= n; i++) {
                        sum *= i;
                    }
                    return sum;
                }
            }
        }

        function ConvertToRadian(degrees) {
            return degrees * Math.PI / 180;
        }


        function ConvertToDegrees(radians) {
            return radians * 180 / Math.PI;
        }
    }


    inputDisplay.onclick = function () {
        flag = false;
        inputDisplay.style.backgroundColor = '#000';
    }
}
