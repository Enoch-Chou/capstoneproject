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

@WebServlet("/datamuse")
public class DatamuseServlet extends HttpServlet {

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        ArrayList<String> resultList = new ArrayList<String>(); 
        String query = request.getParameter("query");
        String[] splitQuery = query.split(" ");
        int count = 0;
        StringBuilder resultString = new StringBuilder();
        for (String word: splitQuery){
            if ((splitQuery.length-1) == count && word.indexOf('?') != -1) {
                word = word.substring(0, word.length()-1);
            }
            
            try {
                URL url = new URL("https://api.datamuse.com/words?md=p&sp=" + word + "&max=1");
                HttpURLConnection con = (HttpURLConnection) url.openConnection();

                con.setRequestMethod("GET");
                con.setRequestProperty("Content-Type", "application/json");

                StringBuilder output;
                BufferedReader input = new BufferedReader(new InputStreamReader(con.getInputStream()));
                String line;
                output = new StringBuilder();

                while ((line = input.readLine()) != null) {
                    output.append(line);
                }
                String str =  output.toString();
                if (str.contains("[\"n\"]") || str.contains("[\"adj\"]")){
                    //resultList.add(word);
                    resultString.append(word);
                    if (count != (splitQuery.length-1)){
                        resultString.append(" ");
                    }
                }
            } catch (Exception e)  { 
                    System.out.println(e.getMessage()); 
            }     
            count++;
        }    
        response.getWriter().println(resultString);
   }
}