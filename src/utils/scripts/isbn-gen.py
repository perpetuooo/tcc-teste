import random

def generate_isbn13():
    
    isbn = "978" + ''.join([str(random.randint(0, 9)) for _ in range(9)])
    total = sum((3 if i % 2 else 1) * int(num) for i, num in enumerate(isbn))
    check_digit = (10 - (total % 10)) % 10

    return isbn + str(check_digit)

print(generate_isbn13())
