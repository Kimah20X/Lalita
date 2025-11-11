import bcrypt
import re
import logging
import json
from datetime import datetime

class EnterprisePasswordSecurity:
    def __init__(self):
        self.logger = self._setup_logging()
        self.pepper = "lalita_enterprise_pepper_v2_2024"
    
    def _setup_logging(self):
        logging.basicConfig(level=logging.INFO)
        return logging.getLogger('PasswordSecurity')
    
    def hash_password(self, password):
        """Enterprise-grade password hashing for 10K+ users"""
        try:
            # Input validation
            if not password or len(password) < 4:
                return self._error_response("Password must be at least 4 characters")
            
            # Add pepper for extra security
            peppered_password = password + self.pepper
            
            # Generate secure hash
            salt = bcrypt.gensalt(rounds=14)  # High security for production
            hashed = bcrypt.hashpw(peppered_password.encode('utf-8'), salt)
            
            self.logger.info(f"Password hashed successfully")
            
            return self._success_response({
                "hash": hashed.decode('utf-8'),
                "algorithm": "bcrypt",
                "salt_rounds": 14,
                "created_at": datetime.now().isoformat()
            })
            
        except Exception as e:
            self.logger.error(f"Password hashing failed: {str(e)}")
            return self._error_response(f"Hashing system error: {str(e)}")
    
    def verify_password(self, password, stored_hash):
        """High-performance password verification"""
        try:
            if not password or not stored_hash:
                return self._success_response({"is_valid": False})
            
            # Add pepper for verification
            peppered_password = password + self.pepper
            
            is_valid = bcrypt.checkpw(peppered_password.encode('utf-8'), 
                                    stored_hash.encode('utf-8'))
            
            return self._success_response({
                "is_valid": is_valid,
                "verified_at": datetime.now().isoformat()
            })
            
        except Exception as e:
            self.logger.error(f"Password verification failed: {str(e)}")
            return self._success_response({"is_valid": False})
    
    def _success_response(self, data):
        return {"success": True, "data": data}
    
    def _error_response(self, message):
        return {"success": False, "error": message}

# JavaScript Bridge Function
def hash_password_for_js():
    """Bridge function for JavaScript integration"""
    import sys
    try:
        # Get password from JavaScript
        password = sys.argv[1] if len(sys.argv) > 1 else None
        
        if not password:
            print(json.dumps({"success": False, "error": "No password provided"}))
            return
        
        security = EnterprisePasswordSecurity()
        result = security.hash_password(password)
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))

def verify_password_for_js():
    """Bridge function for JavaScript password verification"""
    import sys
    try:
        if len(sys.argv) < 3:
            print(json.dumps({"success": False, "error": "Missing parameters"}))
            return
        
        password = sys.argv[1]
        stored_hash = sys.argv[2]
        
        security = EnterprisePasswordSecurity()
        result = security.verify_password(password, stored_hash)
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))

if __name__ == "__main__":
    # Handle JavaScript calls
    if len(sys.argv) > 1:
        action = sys.argv[1]
        if action == "hash":
            hash_password_for_js()
        elif action == "verify":
            verify_password_for_js()
