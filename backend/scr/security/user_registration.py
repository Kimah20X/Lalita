import sys
import json
from password_security import EnterprisePasswordSecurity
from data_encryption import EnterpriseDataEncryption
import logging
from datetime import datetime

class EnterpriseUserRegistration:
    def __init__(self):
        self.password_security = EnterprisePasswordSecurity()
        self.data_encryption = EnterpriseDataEncryption()
        self.logger = self._setup_logging()
    
    def _setup_logging(self):
        logging.basicConfig(level=logging.INFO)
        return logging.getLogger('UserRegistration')
    
    def register_user(self, user_data):
        """Complete user registration with enterprise security"""
        try:
            # Validate input
            validation = self._validate_user_data(user_data)
            if not validation["valid"]:
                return self._error_response(validation["message"])
            
            # Hash password
            password_result = self.password_security.hash_password(user_data["pin"])
            if not password_result["success"]:
                return self._error_response(password_result["error"])
            
            # Encrypt all sensitive data
            encrypted_fields = {}
            
            fields_to_encrypt = [
                ("user_profile", "phone", user_data["phone"]),
                ("user_profile", "name", user_data["name"]),
                ("user_profile", "email", user_data.get("email", "")),
                ("sensitive", "bvn", user_data.get("bvn", "")),
            ]
            
            for data_type, field_name, value in fields_to_encrypt:
                if value:
                    encrypt_result = self.data_encryption.encrypt_data(data_type, value)
                    if encrypt_result["success"]:
                        encrypted_fields[field_name] = encrypt_result["data"]["encrypted_data"]
                    else:
                        return self._error_response(f"Encryption failed for {field_name}")
            
            # Prepare secure user record
            user_record = {
                "user_id": f"user_{user_data['phone'][-8:]}",
                "pin_hash": password_result["data"]["hash"],
                **encrypted_fields,
                "initial_balance": self.data_encryption.encrypt_data("financial", "0")["data"]["encrypted_data"],
                "registration_date": datetime.now().isoformat(),
                "security_level": "enterprise",
                "status": "active"
            }
            
            self.logger.info(f"User registered securely: {user_record['user_id']}")
            
            return self._success_response({
                "user_id": user_record["user_id"],
                "registration_id": f"reg_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                "security_level": "enterprise",
                "encrypted_fields": list(encrypted_fields.keys()),
                "registered_at": user_record["registration_date"]
            })
            
        except Exception as e:
            self.logger.error(f"Registration failed: {str(e)}")
            return self._error_response(f"Registration system error: {str(e)}")
    
    def _validate_user_data(self, user_data):
        """Validate registration data"""
        required = ["phone", "pin", "name"]
        
        for field in required:
            if field not in user_data or not user_data[field]:
                return {"valid": False, "message": f"Missing required field: {field}"}
        
        # Nigerian phone validation
        if not user_data["phone"].startswith('+234') or len(user_data["phone"]) != 14:
            return {"valid": False, "message": "Invalid Nigerian phone number"}
        
        # PIN validation
        if len(user_data["pin"]) < 4 or len(user_data["pin"]) > 6:
            return {"valid": False, "message": "PIN must be 4-6 digits"}
        
        return {"valid": True, "message": "Validation passed"}
    
    def _success_response(self, data):
        return {"success": True, "data": data}
    
    def _error_response(self, message):
        return {"success": False, "error": message}

# JavaScript Bridge
def register_user_for_js():
    """Main bridge function for JavaScript"""
    try:
        # Get JSON data from JavaScript
        user_data_json = sys.argv[1] if len(sys.argv) > 1 else "{}"
        user_data = json.loads(user_data_json)
        
        registration = EnterpriseUserRegistration()
        result = registration.register_user(user_data)
        
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))

if __name__ == "__main__":
    register_user_for_js()
