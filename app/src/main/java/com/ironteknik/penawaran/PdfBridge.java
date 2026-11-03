package com.ironteknik.penawaran;

import android.app.Activity;
import android.content.ContentResolver;
import android.content.ContentValues;
import android.net.Uri;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import android.webkit.JavascriptInterface;
import android.widget.Toast;

import java.io.OutputStream;

public class PdfBridge {
    private final Activity activity;

    public PdfBridge(Activity activity) {
        this.activity = activity;
    }

    @JavascriptInterface
    public void savePdf(String fileName, String base64Pdf) {
        try {
            byte[] pdfBytes = Base64.decode(base64Pdf, Base64.DEFAULT);
            ContentResolver resolver = activity.getContentResolver();

            ContentValues values = new ContentValues();
            values.put(MediaStore.Downloads.DISPLAY_NAME, sanitizeFileName(fileName));
            values.put(MediaStore.Downloads.MIME_TYPE, "application/pdf");
            values.put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/Iron Teknik");
            values.put(MediaStore.Downloads.IS_PENDING, 1);

            Uri uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
            if (uri == null) {
                throw new IllegalStateException("Folder Download tidak tersedia.");
            }

            try (OutputStream outputStream = resolver.openOutputStream(uri)) {
                if (outputStream == null) {
                    resolver.delete(uri, null, null);
                    throw new IllegalStateException("File PDF tidak dapat dibuat.");
                }
                outputStream.write(pdfBytes);
                outputStream.flush();
            }

            values.clear();
            values.put(MediaStore.Downloads.IS_PENDING, 0);
            resolver.update(uri, values, null, null);

            showToast("PDF tersimpan di Download/Iron Teknik");
        } catch (Exception e) {
            showToast("Gagal menyimpan PDF: " + e.getMessage());
        }
    }

    private String sanitizeFileName(String fileName) {
        String safeName = fileName == null ? "surat-penawaran.pdf" : fileName.trim();
        safeName = safeName.replaceAll("[\\\\/:*?\"<>|]", "-");
        if (!safeName.toLowerCase().endsWith(".pdf")) {
            safeName += ".pdf";
        }
        return safeName;
    }

    private void showToast(String message) {
        activity.runOnUiThread(() -> Toast.makeText(activity, message, Toast.LENGTH_LONG).show());
    }
}
