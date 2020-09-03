 
package com.google.sps.servlets;
import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader; 
import java.io.IOException; 
import java.io.InputStream; 
import java.io.InputStreamReader; 
import java.io.OutputStream; 
import java.net.HttpURLConnection; 
import java.net.URL;
import java.util.*;

/* Perform API calls to Datamuse word-finding API to identify keywords.*/
@WebServlet("/datamuse")
public class DatamuseServlet extends HttpServlet {
  /* Determine part of speech for an individual word.*/
  private void addToString(String[] splitQuery, String word, BufferedReader input, StringBuilder resultString, int count) {
        StringBuilder output = new StringBuilder();
        String line;
        try {
            while ((line = input.readLine()) != null) {
                output.append(line);
            }
            String str =  output.toString();
            if (str.contains("[\"n\"]") || str.contains("[\"adj\"]")){
                resultString.append(word);
                if (count != (splitQuery.length - 1)){
                    resultString.append(" ");
                }
            }
        } catch (Exception e)  { 
                    System.out.println(e.getMessage()); 
        }     
  }

  /* Check each word in search query for keyword status based on parts of speech.*/
  private String buildKeywordString(String[] splitQuery) {
        int count = 0;
        StringBuilder resultString = new StringBuilder();
        for (String word: splitQuery){
            if ((splitQuery.length - 1) == count && word.indexOf('?') != -1) {
                word = word.substring(0, word.length() - 1);
            }
            
            try {
                URL url = new URL("https://api.datamuse.com/words?md=p&sp=" + word + "&max=1");
                HttpURLConnection con = (HttpURLConnection) url.openConnection();

                con.setRequestMethod("GET");
                con.setRequestProperty("Content-Type", "application/json");

                
                BufferedReader input = new BufferedReader(new InputStreamReader(con.getInputStream()));
                addToString(splitQuery, word, output, input, resultString, count);

            } catch (Exception e)  { 
                    System.out.println(e.getMessage()); 
            }     
            count++;
        }    
        return resultString.toString();
  }

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String query = request.getParameter("query");
        String[] splitQuery = query.split(" ");
        String finalString = buildKeywordString(splitQuery);
        response.getWriter().println(finalString);
   }
}