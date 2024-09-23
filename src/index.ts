import express, {Request, Response} from "express";
import mysql from "mysql2/promise";

const app = express();

app.set('view engine', 'ejs');
app.set('views', `${__dirname}/views`);

const connection = mysql.createPool({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "mudar123",
    database: "unicesumar"
});

app.use(express.json());

app.use(express.urlencoded({ extended: true }));
//Categorias
app.get('/categories', async function (req: Request, res: Response) {
    const [rows] = await connection.query("SELECT * FROM categories");
    return res.render('categories/index', {
        categories: rows
    });
});

app.get("/categories/form", async function (req: Request, res: Response) {
    return res.render("categories/form");
});

app.post("/categories/save", async function(req: Request, res: Response) {
    const body = req.body;
    const insertQuery = "INSERT INTO categories (name) VALUES (?)";
    await connection.query(insertQuery, [body.name]);

    res.redirect("/categories");
});

app.post("/categories/delete/:id", async function (req: Request, res: Response) {
    const id = req.params.id;
    const sqlDelete = "DELETE FROM categories WHERE id = ?";
    await connection.query(sqlDelete, [id]);

    res.redirect("/categories");
});


//Usuarios
app.get("/users", async function (req: Request, res: Response) {
    const [rows] = await connection.query("SELECT * FROM users");
    return res.render('users/index', {
        users: rows
    });
});

app.get("/users/form", async function (req: Request, res: Response) {
    return res.render("users/form");
});

app.post("/users/add", async function(req: Request, res: Response) {
    const body = req.body;
    if(body.senha == body.confirmarSenha)
        {
    const insertQuery = "INSERT INTO users (name,email,senha,papel) VALUES (?,?,?,?)";
    await connection.query(insertQuery, [body.name,body.email,body.senha,body.papel,body.created_at]);
    res.redirect("/users");
        }
    else
    {
        res.redirect("/users");
    }
    
});

app.post("/users/:id/delete/", async function (req: Request, res: Response) {
    const id = req.params.id;
    const sqlDelete = "DELETE FROM users WHERE id = ?";
    await connection.query(sqlDelete, [id]);
    res.redirect("/users");
});

//Login
//Pagina de login
app.get('/login', async function (req: Request, res: Response) {
    return res.render('login/index');
});

//Efetuar o login
app.post('/login/autenticar',async function (req: Request, res: Response) {
    const {email,senha} = req.body;
    try{
        const [rows]: any = await connection.query(
            'SELECT email,senha FROM users WHERE email = ? AND senha = ?', [email,senha]
        );
        if(rows.length > 0){
            res.redirect('/users')
        }else{
            res.redirect('/login')
        }
    }catch (error){
        console.error("Erro na autenticação, ",error);
        res.redirect('/login')
    }
});

//Blog Pagina inicial
app.get('/', async function (req: Request, res: Response) {
    return res.render('blog/index');
});

app.listen('3000', () => console.log("Server is listening on port 3000"));