package com.ironteknik.penawaran;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.animation.Animation;
import android.view.animation.AnimationUtils;
import android.widget.ImageView;
import android.widget.TextView;

public class SplashActivity extends Activity {
    private static final long SPLASH_DURATION_MS = 1250L;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_splash);

        ImageView logo = findViewById(R.id.splashLogo);
        TextView title = findViewById(R.id.splashTitle);
        TextView subtitle = findViewById(R.id.splashSubtitle);

        Animation logoAnimation = AnimationUtils.loadAnimation(this, R.anim.splash_logo);
        Animation textAnimation = AnimationUtils.loadAnimation(this, R.anim.splash_text);

        logo.startAnimation(logoAnimation);
        title.startAnimation(textAnimation);
        subtitle.startAnimation(textAnimation);

        new Handler(Looper.getMainLooper()).postDelayed(() -> {
            startActivity(new Intent(SplashActivity.this, MainActivity.class));
            overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out);
            finish();
        }, SPLASH_DURATION_MS);
    }
}
