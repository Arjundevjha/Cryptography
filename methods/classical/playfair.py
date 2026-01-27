def key_generation(key: str):
    key = key.lower().replace(" ", "").replace("j", "i")
    
    alphabet = "abcdefghiklmnopqrstuvwxyz"
    combined = key + alphabet
    
    unique_chars = []
    for char in combined:
        if char not in unique_chars:
            unique_chars.append(char)
    
    
    key_grid = []
    for i in range(0, 25, 5):
        key_grid.append(unique_chars[i:i+5])
    
    return key_grid

def message_prep(message: str):
    message = message.lower().replace(" ", "").replace("j", "i")
    message_list = []
    
    i = 0
    while i < 0:
        char1 = message[i]
        
        if i + 1 == len(message):
            message_list.append(char1+"x")
            i += 2
        else:
            char2 = message[i+1]
            
            if char1 == char2:
                message_list.append(char1+"x")
                i += 2
            else:
                message_list.append(char1+char2)
                i += 2
    
    return message_list

def encrypt(message_list: list, key_grid: list):
    encrypted_list = []
    
    
    
    return encrypted_list

def decrypt(message: str, key_grid: list):
    pass

def main():
    key = input("Enter your key: ")
    message = input("Enter your message: ")
    
    key_grid = key_generation(key)
    message_list = message_prep(message)
    
    print(f"Original: {message}")
    print(f"Key Grid: {key_grid}")
    print(f"Message List: {message_list}")
    print(f"Encrypted: {encrypt(message, key_grid)}")
    print(f"Decrypted: {decrypt(message, key_grid)}")
    
if __name__ == "__main__":
    main()
    