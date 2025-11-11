from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import base64
import os
import json
import logging
from datetime import datetime

class EnterpriseDataEncryption:
    def __init__(self, master_key=None):
        self.logger = self._setup_logging()
        
        # Use provided key or generate secure one
        self.master_key = master_key or Fernet.generate_key()
        self.cipher_suite = Fernet(self.master_key)
        
        # Derive specialized keys for different data types
        self.keys = {
            'user_profile': self._derive_key('user_profile_v1'),
            'financial': self._derive_key('financial_data_v1'),
            'sensitive': self._derive_key('sensitive_info_v1')
        }
    
    def _setup_logging(self):
        logging.basicConfig(level=logging.INFO)
        return logging.getLogger('DataEncryption')
    
    def _derive_key(self, purpose):
        """Derive specialized encryption key"""
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=purpose.encode(),
            iterations=100000,
        )
        return base64.urlsafe_b64encode(kdf.derive(self.master_key))
    
    def encrypt_data(self, data_type, plaintext):
        """Encrypt data with type-specific keys"""
        try:
            if not plaintext:
                return self._error_response("No data to encrypt")
            
            # Select appropriate key
            key = self.keys.get(data_type, self.master_key)
            cipher_suite = Fernet(key)
            
            # Encrypt
            if isinstance(plaintext, str):
                plaintext = plaintext.encode('utf-8')
            
            encrypted = cipher_suite.encrypt(plaintext)
            encoded_data = base64.urlsafe_b64encode(encrypted).decode('utf-8')
            
            self.logger.info(f"Data encrypted - Type: {data_type}")
            
            return self._success_response({
                "encrypted_data": encoded_data,
                "data_type": data_type,
                "algorithm": "AES-256",
                "encrypted_at": datetime.now().isoformat()
            })
            
        except Exception as e:
            self.logger.error(f"Encryption failed: {str(e)}")
            return self._error_response(f"Encryption error: {str(e)}")
    
    def decrypt_data(self, data_type, encrypted_data):
        """Decrypt data when needed"""
        try:
            if not encrypted_data:
                return self._error_response("No encrypted data provided")
            
            # Select appropriate key
            key = self.keys.get(data_type, self.master_key)
            cipher_suite = Fernet(key)
            
            # Decode and decrypt
            encrypted_bytes = base64.urlsafe_b64decode(encrypted_data.encode('utf-8'))
            decrypted_bytes = cipher_suite.decrypt(encrypted_bytes)
            decrypted_text = decrypted_bytes.decode('utf-8')
            
            return self._success_response({
                "decrypted_data": decrypted_text,
                "data_type": data_type,
                "decrypted_at": datetime.now().isoformat()
            })
            
        except Exception as e:
            self.logger.error(f"Decryption failed: {str(e)}")
            return self._error_response(f"Decryption error: {str(e)}")
    
    def get_system_status(self):
        """Get encryption system status"""
        return self._success_response({
            "system": "EnterpriseDataEncryption",
            "status": "ACTIVE",
            "keys_initialized": len(self.keys),
            "algorithm": "AES-256-Fernet",
            "timestamp": datetime.now().isoformat()
        })
    
    def _success_response(self, data):
        return {"success": True, "data": data}
    
    def _error_response(self, message):
        return {"success": False, "error": message}

# JavaScript Bridge Functions
def encrypt_for_js():
    """Bridge function for JavaScript encryption"""
    import sys
    try:
        if len(sys.argv) < 3:
            print(json.dumps({"success": False, "error": "Missing parameters"}))
            return
        
        data_type = sys.argv[1]
        plaintext = sys.argv[2]
        
        encryptor = EnterpriseDataEncryption()
        result = encryptor.encrypt_data(data_type, plaintext)
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))

def decrypt_for_js():
    """Bridge function for JavaScript decryption"""
    import sys
    try:
        if len(sys.argv) < 3:
            print(json.dumps({"success": False, "error": "Missing parameters"}))
            return
        
        data_type = sys.argv[1]
        encrypted_data = sys.argv[2]
        
        encryptor = EnterpriseDataEncryption()
        result = encryptor.decrypt_data(data_type, encrypted_data)
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))

if __name__ == "__main__":
    if len(sys.argv) > 1:
        action = sys.argv[1]
        if action == "encrypt":
            encrypt_for_js()
        elif action == "decrypt":
            decrypt_for_js()
        elif action == "status":
            encryptor = EnterpriseDataEncryption()
            result = encryptor.get_system_status()
            print(json.dumps(result))
        
