# Define a Node class for tree construction
class Node:
    def __init__(self, value, left=None, right=None):
        self.value = value  # The value (operator or operand)
        self.left = left    # Left child (for unary and binary operators)
        self.right = right  # Right child (only used for binary operators)

# Step 1: Operator precedence
def precedence(op):
    # The higher the value, the higher the precedence.
    # '~' is the highest, then '&' and '|' (which have equal precedence),
    # and '-->' (implication) has the lowest.
    precedence_order = {
        '~': 3,
        '&': 2,
        '|': 2,
        '-->': 0,
        '(': -1  # '(' is a marker; it doesn't participate in precedence.
    }
    return precedence_order.get(op, -1)

# Step 2: Convert infix to postfix (token list)
def infix_to_postfix(expression):
    # Remove spaces for easier processing.
    expression = expression.replace(" ", "")
    output = []   # List to store the output tokens (postfix expression)
    stack = []    # Stack for operators
    i = 0
    while i < len(expression):
        # If it's an operand (alphanumeric), add directly to the output.
        if expression[i].isalnum():
            output.append(expression[i])
        elif expression[i] == '(':
            stack.append(expression[i])
        elif expression[i] == ')':
            # Pop until a left parenthesis is found.
            while stack and stack[-1] != '(':
                output.append(stack.pop())
            if stack:
                stack.pop()  # Remove the '('
        # Check for the multi-character operator '-->' (3 characters)
        elif i <= len(expression) - 3 and expression[i:i+3] == '-->':
            # For right-associative operators (like implication),
            # pop only operators with strictly greater precedence.
            while stack and precedence(stack[-1]) > precedence('-->'):
                output.append(stack.pop())
            stack.append('-->')
            i += 2  # Skip the next 2 characters (total length is 3)
        # Handle single-character operators: '~', '&', '|'
        elif expression[i] in {'~', '&', '|'}:
            # For left-associative operators, pop while the operator on top of the
            # stack has greater or equal precedence.
            while stack and precedence(stack[-1]) >= precedence(expression[i]):
                output.append(stack.pop())
            stack.append(expression[i])
        else:
            # Ignore any unrecognized characters.
            pass
        i += 1

    # Append any remaining operators from the stack to the output.
    while stack:
        output.append(stack.pop())

    return output  # Return a list of tokens

# Step 3: Build an expression tree from postfix tokens.
def build_tree(postfix_tokens):
    stack = []
    for token in postfix_tokens:
        # If token is an operand, create a leaf node.
        if token.isalnum():
            stack.append(Node(token))
        else:
            # For operators:
            if token == "~":
                # '~' is unary: pop one node.
                if not stack:
                    raise Exception("Invalid expression: insufficient operands for '~'")
                child = stack.pop()
                node = Node(token, left=child)
                stack.append(node)
            else:
                # For binary operators (like &, |, -->): pop two nodes.
                if len(stack) < 2:
                    raise Exception("Invalid expression: insufficient operands for binary operator")
                right = stack.pop()
                left = stack.pop()
                node = Node(token, left=left, right=right)
                stack.append(node)
    if len(stack) != 1:
        raise Exception("Invalid expression: leftover elements in stack")
    return stack[0]

# Step 4: Print the tree in a sideways manner.
def print_tree(node, level=0):
    """
    This function prints the tree sideways so that the root is on the left.
    Right children are printed above their parent, left children below.
    """
    if node is not None:
        print_tree(node.right, level + 1)
        print("     " * level + str(node.value))
        print_tree(node.left, level + 1)

if __name__ == "__main__":
    # Read the logical formula from the user.
    expression = input("Enter a logical formula (e.g., A&(B|C) or A-->B): ")

    # Convert infix to postfix.
    postfix_tokens = infix_to_postfix(expression)
    print("\nPostfix notation:", " ".join(postfix_tokens))
    
    # Build the expression tree.
    try:
        tree_root = build_tree(postfix_tokens)
        print("\nExpression Tree:")
        print_tree(tree_root)
    except Exception as e:
        print("Error building tree:", e)
