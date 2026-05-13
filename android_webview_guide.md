# Android WebView Wrapper Guide

To turn this web application into a mobile app, you can create a simple Android application using a WebView.

## Steps to Create the App

1.  **Open Android Studio**: Create a new project with an "Empty Activity" template.
2.  **Add Internet Permission**: In `app/src/main/AndroidManifest.xml`, add:
    ```xml
    <uses-permission android:name="android.permission.INTERNET" />
    ```
3.  **Layout Setup**: In `activity_main.xml`, add a `WebView`:
    ```xml
    <WebView
        android:id="@+id/webview"
        android:layout_width="match_parent"
        android:layout_height="match_parent" />
    ```

## Java Code (MainActivity.java)

Copy the following into your `MainActivity.java`:

```java
import android.os.Bundle;
import android.view.KeyEvent;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {
    private WebView myWebView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        myWebView = (WebView) findViewById(R.id.webview);
        WebSettings webSettings = myWebView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        
        // Ensure links open inside the app
        myWebView.setWebViewClient(new WebViewClient());

        // Replace with your server's local IP address
        myWebView.loadUrl("http://192.168.1.10:5000"); 
    }

    // Handle back button inside WebView
    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if ((keyCode == KeyEvent.KEYCODE_BACK) && myWebView.canGoBack()) {
            myWebView.goBack();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }
}
```

## Tips for Local Network

- Ensure your phone and the server are on the same Wi-Fi network.
- Use the server's local IP address (e.g., `192.168.x.x`) instead of `localhost`.
- If the app doesn't load, check your server's firewall settings to allow traffic on port 5000.
