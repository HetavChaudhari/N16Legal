import React from 'react';
import '../CSS/index.css';
import '../CSS/About.css';

const About = () => {
    return (
        <>
            <div className="team">
                <p>Our Team</p>
                <h1>Meet the Legal Experts Behind N16Legal</h1>
                <p><i>Experienced, dedicated, and committed to delivering justice for every client we serve.</i></p>

                <p>N16Legal was founded in 2010 with a singular mission: to provide every client with the highest calibre of
                    legal representation, irrespective of the complexity or nature of their case.</p>
                <p>Our team of experienced lawyers brings a wealth of expertise across criminal law, civil litigation, family
                    matters, property disputes, and legal documentation — ensuring comprehensive legal support under one roof.
                </p>
            </div>

            <div className="lawyers">
                <h2>Our Legal Team</h2>
                <div className="lawyer-1">
                    <h3>Senior Lawyer</h3>
                    <div className="left">
                        <img src="/Asstes/Lawyer2.png" alt="Lawyer" />
                    </div>
                    <div className="right">
                        <p>Adv. Hetav Chaudhari</p>
                        <p>Speciality:Criminal & Civil</p>
                        <p>Education:BE, ME, LLB · Bar Council of India</p>
                        <p>"Every accused deserves a vigorous defence. That's not just the law — it's justice."</p>
                        <br />
                        <p>Criminal Law Civil Litigation Property Law</p>
                    </div>
                </div>

                <div className="lawyer-2">
                    <h3>Lawyer</h3>
                    <div className="left">
                        <img src="/Asstes/Lawyer1.png" alt="Lawyer" />
                    </div>
                    <div className="right">
                        <p>Adv. Tapan Chaudhari</p>
                        <p>Speciality:Family & Divorce Law</p>
                        <p>Education:BA, MA, LLB</p>
                        <p>"Family law demands both legal precision and human empathy. I bring both to every case."</p>
                        <br />
                        <p>Family Law Divorce Proceedings Child Custody</p>
                    </div>
                </div>

                <div className="lawyer-3">
                    <h3>Associate</h3>
                    <div className="left">
                        <img src="/Asstes/Lawyer1.png" alt="Lawyer" />
                    </div>
                    <div className="right">
                        <p>Adv. Divyanshu Kokani</p>
                        <p>Speciality:Associate — Legal Documentation</p>
                        <p>Education:BA, LLB</p>
                        <p>"Every client's first call is equally important. I ensure every case gets the attention it deserves."</p>
                        <br />
                        <p>Appointments Documentation Client Relations</p>
                    </div>
                </div>

                <div className="lawyer-4">
                    <h3>Secretry</h3>
                    <div className="left">
                        <img src="/Asstes/Secretry.png" alt="Secretary" />
                    </div>
                    <div className="right">
                        <p>Adv. Pooja Hegde</p>
                        <p>Speciality:Legal Secretary & Case Coordinator</p>
                        <p>BA, LLB · Office Management</p>
                        <p>"Every client's first call is equally important. I ensure every case gets the attention it deserves."</p>
                        <br />
                        <p>Appointments Documentation Client Relations</p>
                    </div>
                </div>
            </div>

            <div className="firm">
                <h3>Firm Values</h3>
                <div className="justice">
                    <p>Justice</p>
                    <p>We believe in equal access to justice. Every client receives the same level of dedication and expertise regardless of the case.</p>
                </div>
                <div className="integrity">
                    <p>Integrity</p>
                    <p>We operate with absolute transparency and honesty. No hidden fees, no false promises — only realistic guidance and genuine effort.</p>
                </div>
                <div className="excellence">
                    <p>Excellence</p>
                    <p>We pursue excellence in every legal matter — from the smallest affidavit to the most complex criminal trial.</p>
                </div>
            </div>
        </>
    );
};

export default About;
