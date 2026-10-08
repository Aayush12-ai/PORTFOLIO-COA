import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
     Scanner sc = new Scanner(System.in);

        System.out.println("Enter your name:");
        String name = sc.next();

        int rollNumber=sc.nextInt();
        float marks=sc.nextFloat();

        System.out.println("name:"+name+rollNumber+marks);
    }
}