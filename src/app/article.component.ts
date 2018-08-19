import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ArticleService } from './article.service';
import { Article } from './article';

@Component({ 
    selector: 'app-article',
    templateUrl: './article.component.html',
    styleUrls: ['./article.component.css']
})

export class ArticleComponent implements OnInit {
// Component properties
    allArticles: Article[];
    statusCode: number;
    requestProcessing = false;
    articleIdToUpdate = null;
    proceessValidation = false;

    // Create form

    articleform = new FormGroup({
        title: new FormControl('', Validators.required),
        category: new FormControl('', Validators.required)
    });

    // Create constructor to get service instance
    constructor(private articleService: ArticleService) {
    }

    // create ngOnInit() and load articles
    ngOnInit(): void {
        this.getAllArticles();
    } 

    // fetch all articles
    getAllArticles() {
        this.articleService.getAllArticles().subscribe(data => this.allArticles = data, 
                                                       errorCode => this.statusCode = errorCode);
    }

    // handle create and update article
    onArticleFormSubmit() {
        this.proceessValidation = true;

        // if validation failed, exit from method
        if (this.articleform.invalid) {
            return;
        }

        this.preProcessConfigurations();

        let title = this.articleform.get('title').value.trim();
        let category = this.articleform.get('category').value.trim();

        if (this.articleIdToUpdate === null) {
            // handle create article
            let article = new Article(null, title, category);
            this.articleService.createArticle(article)
                                    .subscribe(successCode => {
                                         this.statusCode = successCode;
                                         this.getAllArticles();
                                         this.backToCreateArticle();
                                    }, errorCode => this.statusCode = errorCode);
        } else {
            // handle update article
            let article = new Article(this.articleIdToUpdate, title, category);
            this.articleService.updateArticle(article)
                                    .subscribe(successCode => {
                                        this.statusCode = successCode;
                                        this.getAllArticles();
                                        this.backToCreateArticle();
                                    }, errorCode => this.statusCode = errorCode);
        }
    }

    // load article by id to edit
    loadArticleToEdit(articleId: string) {
        this.preProcessConfigurations();
        this.articleService.getArticleById(articleId)
                                .subscribe(article => {
                                    this.articleIdToUpdate = article.articleId;
                                    this.articleform.setValue({ title: article.title, category: article.category });
                                    this.proceessValidation = true;
                                    this.requestProcessing = false;
                                }, errorCode => this.statusCode = errorCode);
    }

    // delete article
    deleteArticle(articleId: string) {
        this.preProcessConfigurations();
        this.articleService.deleteArticleById(articleId)
                                .subscribe(successCode => {
                                    this.statusCode = successCode;
                                    this.getAllArticles();
                                    this.backToCreateArticle();
                                }, errorCode => this.statusCode = errorCode);
    }

    // perdorm preliminary processing
    preProcessConfigurations() {
        this.statusCode = null;
        this.requestProcessing = true;
    }

    // go back from update to create
    backToCreateArticle() {
        this.articleIdToUpdate = null;
        this.articleform.reset();
        this.proceessValidation = false;
    }
 }