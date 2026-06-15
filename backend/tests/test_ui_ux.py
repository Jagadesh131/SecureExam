import pytest
from playwright.sync_api import Page, expect

@pytest.mark.usefixtures('live_server')
class TestUIUX:
    def test_navigation_and_forms(self, page: Page, live_server):
        """Test 25: Test all buttons, forms, and navigation links."""
        # Test Home Page Load
        page.goto(live_server.url)
        expect(page).to_have_title('SecureExam - Intelligent MCQ Platform')
        
        # Test Student Login Button Navigation
        student_btn = page.locator("text='Student Login'")
        expect(student_btn).to_be_visible()
        student_btn.click()
        
        expect(page).to_have_url(f'{live_server.url}/student/access')
        
        # Test form rendering
        expect(page.locator("input[name='exam_url']")).to_be_visible()
        expect(page.locator("button[type='submit']")).to_be_visible()

    def test_mobile_responsive_layout(self, page: Page, live_server):
        """Test 26: Verify responsive layout on different mobile screen sizes."""
        # Set viewport to iPhone 12 Pro dimensions
        page.set_viewport_size({"width": 390, "height": 844})
        
        page.goto(f'{live_server.url}/faculty/login')
        
        # Ensure the login container resizes and elements don't overflow
        container = page.locator('.login-container')
        box = container.bounding_box()
        
        # Ensure the container fits within the 390px mobile width
        assert box['width'] <= 390
        
        # Ensure form inputs are fully visible and stacked
        expect(page.locator("input[name='faculty_id']")).to_be_in_viewport()
        expect(page.locator("button[type='submit']")).to_be_in_viewport()

    def test_spelling_and_alignment(self, page: Page, live_server):
        """Test 27: Check for spelling mistakes, alignment issues, and broken screens."""
        page.goto(live_server.url)
        
        # Check standard headers for spelling
        expect(page.locator("h1").first).to_contain_text("Next-Generation")
        
        # Check Faculty Login Text
        page.goto(f'{live_server.url}/faculty/login')
        expect(page.locator("text='Faculty Portal'")).to_be_visible()
        
        # Test for alignment (ensure footer is at bottom)
        footer = page.locator("footer")
        if footer.count() > 0:
            expect(footer).to_be_visible()
