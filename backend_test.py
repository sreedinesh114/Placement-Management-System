import requests
import sys
from datetime import datetime
import json

class PlacementAPITester:
    def __init__(self, base_url="https://recruit-track-7.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                self.failed_tests.append({
                    'test': name,
                    'endpoint': endpoint,
                    'expected': expected_status,
                    'actual': response.status_code,
                    'response': response.text[:200] if response.text else ''
                })

            try:
                return success, response.json() if response.text else {}
            except:
                return success, {"raw_response": response.text}

        except requests.exceptions.RequestException as e:
            print(f"❌ Failed - Network Error: {str(e)}")
            self.failed_tests.append({
                'test': name,
                'endpoint': endpoint,
                'error': str(e)
            })
            return False, {}

    def test_register(self, email, password, role='student', first_name='Test', last_name='User', branch='CSE', roll_number='2021001'):
        """Test user registration"""
        data = {
            "email": email,
            "password": password,
            "role": role,
            "first_name": first_name,
            "last_name": last_name,
        }
        if role == 'student':
            data.update({"branch": branch, "roll_number": roll_number})
        
        success, response = self.run_test(
            f"Register {role}",
            "POST",
            "auth/register",
            200,
            data=data
        )
        if success and 'token' in response:
            self.token = response['token']
            if 'user' in response:
                self.user_id = response['user'].get('id')
            return True, response
        return False, response

    def test_login(self, email, password):
        """Test user login"""
        success, response = self.run_test(
            "Login",
            "POST",
            "auth/login",
            200,
            data={"email": email, "password": password}
        )
        if success and 'token' in response:
            self.token = response['token']
            if 'user' in response:
                self.user_id = response['user'].get('id')
            return True, response
        return False, response

    def test_get_me(self):
        """Test get current user"""
        return self.run_test("Get Current User", "GET", "auth/me", 200)

    def test_companies_crud(self):
        """Test companies CRUD operations"""
        # Get companies
        success, _ = self.run_test("Get Companies", "GET", "companies", 200)
        if not success:
            return False
        
        # Create company (officer only)
        company_data = {
            "name": f"Test Company {datetime.now().strftime('%H%M%S')}",
            "industry": "Technology",
            "students_hired": 5,
            "avg_package": 8.5,
            "status": "active"
        }
        success, response = self.run_test("Create Company", "POST", "companies", 200, data=company_data)
        return success

    def test_drives_crud(self):
        """Test drives CRUD operations"""
        # Get drives
        success, _ = self.run_test("Get Drives", "GET", "drives", 200)
        if not success:
            return False
        
        # Create drive (officer only)
        drive_data = {
            "company": "Test Company",
            "role": "Software Developer",
            "package": "8-12 LPA",
            "drive_date": "2025-02-15",
            "location": "Campus",
            "min_cgpa": 7.0,
            "slots": 20
        }
        success, response = self.run_test("Create Drive", "POST", "drives", 200, data=drive_data)
        
        if success and 'id' in response:
            drive_id = response['id']
            # Test delete drive
            self.run_test("Delete Drive", "DELETE", f"drives/{drive_id}", 200)
        
        return success

    def test_students_list(self):
        """Test students listing (officer only)"""
        return self.run_test("Get Students", "GET", "students", 200)[0]

    def test_applications_crud(self):
        """Test applications CRUD operations"""
        # Get applications
        success, _ = self.run_test("Get Applications", "GET", "applications", 200)
        return success

    def test_profile_operations(self):
        """Test profile operations"""
        # Get profile
        success, _ = self.run_test("Get Profile", "GET", "profile", 200)
        if not success:
            return False
        
        # Update profile
        update_data = {
            "phone": "9876543210",
            "cgpa": 8.5,
            "skills": ["Python", "JavaScript", "React"]
        }
        success, _ = self.run_test("Update Profile", "PUT", "profile", 200, data=update_data)
        return success

    def test_analytics(self):
        """Test analytics endpoint (officer only)"""
        return self.run_test("Get Analytics", "GET", "analytics", 200)[0]

    def test_feedback_forms(self):
        """Test feedback forms"""
        # Get feedback forms
        success, _ = self.run_test("Get Feedback Forms", "GET", "feedback-forms", 200)
        if not success:
            return False
        
        # Create feedback form (officer only)
        form_data = {
            "title": "Technical Interview Feedback",
            "form_link": "https://forms.google.com/test",
            "expiry_date": "2025-03-01",
            "target_role": "Software Developer"
        }
        success, _ = self.run_test("Create Feedback Form", "POST", "feedback-forms", 200, data=form_data)
        return success

    def test_ai_assistant(self):
        """Test AI assistant endpoints"""
        # Test chat
        chat_success, _ = self.run_test(
            "AI Chat", 
            "POST", 
            "ai-assistant/chat", 
            200, 
            data={"message": "Hello, I need career advice"}
        )
        
        # Test eligibility
        eligibility_success, _ = self.run_test("AI Eligibility", "GET", "ai-assistant/eligibility", 200)
        
        return chat_success and eligibility_success

def main():
    print("🚀 Starting Placement Management System API Tests")
    print("=" * 60)
    
    tester = PlacementAPITester()
    timestamp = datetime.now().strftime('%H%M%S')
    
    # Test data
    student_email = f"student{timestamp}@test.com"
    officer_email = f"officer{timestamp}@test.com"
    test_password = "TestPass123!"
    
    # Test 1: Student Registration and Login
    print("\n📚 Testing Student Flow...")
    student_reg_success, _ = tester.test_register(
        student_email, test_password, 'student', 'John', 'Doe', 'Computer Science', '2021001'
    )
    
    if not student_reg_success:
        print("❌ Student registration failed, stopping tests")
        return 1
    
    # Test student endpoints
    tester.test_get_me()
    tester.test_companies_crud()  # Should work for getting
    tester.test_drives_crud()     # Should work for getting, fail for creating
    tester.test_applications_crud()
    tester.test_profile_operations()
    tester.test_ai_assistant()
    
    # Test 2: Officer Registration and Login
    print("\n👨‍💼 Testing Officer Flow...")
    officer_tester = PlacementAPITester()
    officer_reg_success, _ = officer_tester.test_register(
        officer_email, test_password, 'officer', 'Jane', 'Smith'
    )
    
    if not officer_reg_success:
        print("❌ Officer registration failed")
        return 1
    
    # Test officer endpoints
    officer_tester.test_get_me()
    officer_tester.test_companies_crud()
    officer_tester.test_drives_crud()
    officer_tester.test_students_list()
    officer_tester.test_applications_crud()
    officer_tester.test_analytics()
    officer_tester.test_feedback_forms()
    
    # Print combined results
    total_tests = tester.tests_run + officer_tester.tests_run
    total_passed = tester.tests_passed + officer_tester.tests_passed
    all_failed = tester.failed_tests + officer_tester.failed_tests
    
    print("\n" + "=" * 60)
    print(f"📊 Final Results: {total_passed}/{total_tests} tests passed")
    
    if all_failed:
        print("\n❌ Failed Tests:")
        for failure in all_failed:
            print(f"  - {failure.get('test', 'Unknown')}: {failure.get('error', failure.get('response', 'Unknown error'))}")
    
    success_rate = (total_passed / total_tests * 100) if total_tests > 0 else 0
    print(f"✅ Success Rate: {success_rate:.1f}%")
    
    return 0 if success_rate > 80 else 1

if __name__ == "__main__":
    sys.exit(main())